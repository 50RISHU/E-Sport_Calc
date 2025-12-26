// src/lib/stores/tournamentStore.ts
import { writable } from "svelte/store";
import { supabase } from "$lib/supabaseClient";

// --- INTERFACES ---
export interface Team {
    id: string;
    name: string;
    tag?: string;
    logo?: string | null;
    group?: string | null;
    players: string[];
}

export interface MatchResult {
    teamId: string;
    kills: number;
    place: number;
    killPoints: number;
    placePoints: number;
    totalPoints: number;
}

export interface Match {
    matchId: number; // The visual ID (Match 1, Match 2)
    results: MatchResult[];
}

export interface Tournament {
    id: string;
    name: string;
    createdDate: Date;
    roundRobin: boolean;
    groupCount: number;
    scoring: {
        killPoints: number;
        positions: { place: number; points: number }[];
    };
    teams: Team[];
    matches: Match[];
}

// --- STORE LOGIC ---
function createTournamentStore() {
    const { subscribe, set, update } = writable<Tournament[]>([]);

    return {
        subscribe,

        // 1. FETCH DATA FROM SUPABASE
        async loadTournaments() {
            const { data: tournaments, error } = await supabase
                .from('tournaments')
                .select(`
                    *,
                    teams (*),
                    matches (*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error loading tournaments:", error);
                return;
            }

            // Transform DB data to match our TypeScript Interfaces
            const formattedData: Tournament[] = tournaments.map((t: any) => ({
                id: t.id,
                name: t.name,
                createdDate: new Date(t.created_at),
                roundRobin: t.round_robin,
                groupCount: t.group_count,
                scoring: t.scoring || { killPoints: 1, positions: [] },
                teams: t.teams || [],
                // Parse match results if they are stored as JSON strings
                matches: (t.matches || []).map((m: any) => ({
                    matchId: m.match_id_manual,
                    results: typeof m.results === 'string' ? JSON.parse(m.results) : m.results
                })).sort((a: Match, b: Match) => a.matchId - b.matchId) // Ensure matches are ordered 1, 2, 3...
            }));

            set(formattedData);
        },

        // 2. ADD TOURNAMENT
        async addTournament(payload: { name: string; roundRobin: boolean; groupCount: number }) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Default Scoring
            const initialScoring = {
                killPoints: 1,
                positions: [
                    { place: 1, points: 15 }, { place: 2, points: 12 }, { place: 3, points: 10 },
                    { place: 4, points: 8 },  { place: 5, points: 6 },  { place: 6, points: 4 },
                    { place: 7, points: 2 },  { place: 8, points: 1 },  { place: 9, points: 1 },
                    { place: 10, points: 1 }, { place: 11, points: 0 }, { place: 12, points: 0 }
                ]
            };

            const { data, error } = await supabase
                .from('tournaments')
                .insert({
                    user_id: user.id,
                    name: payload.name,
                    round_robin: payload.roundRobin,
                    group_count: payload.groupCount,
                    scoring: initialScoring
                })
                .select()
                .single();

            // CHECK FOR DUPLICATE ERROR
            if (error) {
                if (error.code === '23505') { // Postgres code for Unique Violation
                    alert("A tournament with this name already exists!");
                    return null;
                }
                console.error("Error creating tournament:", error);
                return null;
            }

            if (data) {
                const newT: Tournament = {
                    id: data.id,
                    name: data.name,
                    createdDate: new Date(data.created_at),
                    roundRobin: data.round_robin,
                    groupCount: data.group_count,
                    scoring: data.scoring,
                    teams: [],
                    matches: []
                };
                update(list => [newT, ...list]);
                return data.id;
            }
            return null;
        },

        // 3. REMOVE TOURNAMENT
        async removeTournament(id: string) {
            const { error } = await supabase.from('tournaments').delete().eq('id', id);
            if (!error) {
                update(list => list.filter(t => t.id !== id));
            } else {
                console.error("Delete failed:", error);
            }
        },

        // 4. ADD TEAM
        async addTeam(tournamentId: string, team: { name: string; tag: string; group?: string; players: string[], logo?: string | null }) {
            const { data, error } = await supabase
                .from('teams')
                .insert({
                    tournament_id: tournamentId,
                    name: team.name,
                    tag: team.tag,
                    group: team.group,
                    players: team.players, // Supabase JS client handles string[] -> text[]
                    logo: team.logo
                })
                .select()
                .single();

            if (data && !error) {
                update(list => list.map(t => {
                    if (t.id === tournamentId) {
                        return { ...t, teams: [...t.teams, data] };
                    }
                    return t;
                }));
                return true;
            } else {
                console.error("Add team error:", error);
                return false;
            }
        },

        // 5. REMOVE TEAM
        async removeTeam(tournamentId: string, teamId: string) {
            const { error } = await supabase.from('teams').delete().eq('id', teamId);
            if (!error) {
                update(list => list.map(t => {
                    if (t.id === tournamentId) {
                        return { ...t, teams: t.teams.filter(team => team.id !== teamId) };
                    }
                    return t;
                }));
            }
        },

        // 6. SAVE MATCH (Upsert)
        async saveMatch(tournamentId: string, matchId: number, results: MatchResult[]) {
            const { error } = await supabase
                .from('matches')
                .upsert({
                    tournament_id: tournamentId,
                    match_id_manual: matchId,
                    results: results
                }, { onConflict: 'tournament_id, match_id_manual' });

            if (error) {
                console.error("Error saving match:", error);
                return false;
            } else {
                update(list => list.map(t => {
                    if (t.id === tournamentId) {
                        const existingMatchIndex = t.matches.findIndex(m => m.matchId === matchId);
                        const updatedMatches = [...t.matches];
                        
                        if (existingMatchIndex >= 0) {
                            updatedMatches[existingMatchIndex] = { matchId, results };
                        } else {
                            updatedMatches.push({ matchId, results });
                        }
                        // Keep matches sorted by ID
                        updatedMatches.sort((a, b) => a.matchId - b.matchId);
                        return { ...t, matches: updatedMatches };
                    }
                    return t;
                }));
                return true;
            }
        },

        // 7. DELETE MATCH (NEW)
        async deleteMatch(tournamentId: string, matchId: number) {
            const { error } = await supabase
                .from('matches')
                .delete()
                .match({ tournament_id: tournamentId, match_id_manual: matchId });

            if (!error) {
                update(list => list.map(t => {
                    if (t.id === tournamentId) {
                        return { ...t, matches: t.matches.filter(m => m.matchId !== matchId) };
                    }
                    return t;
                }));
            }
        },

        // 8. UPDATE SCORING
        async updateScoring(id: string, newScoring: { killPoints: number; positions: { place: number; points: number }[] }) {
             // Optimistic UI Update
             update(list => list.map(t => {
                if (t.id === id) {
                    return { ...t, scoring: newScoring };
                }
                return t;
            }));

            // Background DB Update
            await supabase.from('tournaments').update({ scoring: newScoring }).eq('id', id);
        },

        // ... previous code ...

        // 9. LOAD USER PRESETS (NEW)
        async getUserPresets() {
            const { data, error } = await supabase
                .from('scoring_presets')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error loading presets:", error);
                return [];
            }
            return data;
        },

        // 10. SAVE NEW PRESET (NEW)
        async savePreset(name: string, scoring: any) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('scoring_presets')
                .insert({
                    user_id: user.id,
                    name: name,
                    scoring: scoring
                })
                .select()
                .single();

            if (error) {
                alert("Error saving preset: " + error.message);
                return null;
            }
            return data;
        },

        // 11. DELETE PRESET (NEW)
        async deletePreset(id: string) {
            const { error } = await supabase
                .from('scoring_presets')
                .delete()
                .eq('id', id);
            
            return !error;
        }
    };
}

export const tournamentStore = createTournamentStore();