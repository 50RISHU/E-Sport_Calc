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
                // We need to parse match results if they are stored as JSON
                matches: (t.matches || []).map((m: any) => ({
                    matchId: m.match_id_manual,
                    results: typeof m.results === 'string' ? JSON.parse(m.results) : m.results
                }))
            }));

            set(formattedData);
        },

        // 2. ADD TOURNAMENT
        async addTournament(payload: { name: string; roundRobin: boolean; groupCount: number }) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return "";

            // Default Scoring
            const initialScoring = {
                killPoints: 1,
                positions: Array.from({ length: 20 }, (_, i) => ({ place: i + 1, points: 0 }))
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

            if (data && !error) {
                // Add to local store immediately to update UI
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
            return "";
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
                    players: team.players,
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
            // Because our SQL table has a UNIQUE constraint on (tournament_id, match_id_manual),
            // we can use .upsert() directly.
            
            // First we need to find if this match exists to get its DB ID, OR just rely on the constraint
            const { error } = await supabase
                .from('matches')
                .upsert({
                    tournament_id: tournamentId,
                    match_id_manual: matchId,
                    results: results
                }, { onConflict: 'tournament_id, match_id_manual' });

            if (error) {
                console.error("Error saving match:", error);
                alert("Failed to save match data.");
            } else {
                // Update Local Store
                update(list => list.map(t => {
                    if (t.id === tournamentId) {
                        const existingMatchIndex = t.matches.findIndex(m => m.matchId === matchId);
                        const updatedMatches = [...t.matches];
                        
                        if (existingMatchIndex >= 0) {
                            updatedMatches[existingMatchIndex] = { matchId, results };
                        } else {
                            updatedMatches.push({ matchId, results });
                        }
                        return { ...t, matches: updatedMatches };
                    }
                    return t;
                }));
            }
        },

        // 7. UPDATE SCORING (Kill Points)
        async updateKillPoints(id: string, points: number) {
            // We need to fetch current scoring, update it, and save back
            // Or ideally, update local state and push to DB.
            update(list => list.map(t => {
                if (t.id === id) {
                    const newScoring = { ...t.scoring, killPoints: points };
                    
                    // Fire and forget update to DB (or handle await if strict)
                    supabase.from('tournaments').update({ scoring: newScoring }).eq('id', id).then();
                    
                    return { ...t, scoring: newScoring };
                }
                return t;
            }));
        },

        // 8. UPDATE SCORING (Position Points)
        async updatePositionPoints(id: string, positions: { place: number; points: number }[]) {
            update(list => list.map(t => {
                if (t.id === id) {
                    const newScoring = { ...t.scoring, positions };
                    
                    supabase.from('tournaments').update({ scoring: newScoring }).eq('id', id).then();

                    return { ...t, scoring: newScoring };
                }
                return t;
            }));
        }
    };
}

export const tournamentStore = createTournamentStore();