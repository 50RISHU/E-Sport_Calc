// src/lib/stores/tournamentStore.ts
import { writable } from "svelte/store";
import { browser } from "$app/environment";

export interface Team {
    id: string;
    name: string;
    tag: string;
    logo: string | null;
    number: number;
    group: string | null;
    players: string[];
}

export interface MatchResult {
    teamId: string;
    kills: number;
    position: number;
    killPoints: number;
    placePoints: number;
    totalPoints: number;
}

export interface Match {
    id: number;
    name: string;
    results: MatchResult[];
}

export interface Tournament {
    id: string;
    name: string;
    roundRobin: boolean;
    groupCount: number;
    teams: Team[];
    matches: Match[];
    createdAt: string;
    scoring: {
        killPoints: number;
        positions: { place: number; points: number }[];
    }
}

const LOCAL_KEY = "tournaments_v1";
const DEFAULTS_KEY = "scoring_defaults"; // New key for saving defaults

function safeParse<T>(v: string | null, fallback: T): T {
    if (!v) return fallback;
    try {
        return JSON.parse(v) as T;
    } catch {
        return fallback;
    }
}

function createTournamentStore() {
    // Load initial data
    let initialData = browser
        ? safeParse<Tournament[]>(localStorage.getItem(LOCAL_KEY), [])
        : [];

    // DATA MIGRATION FIX: Ensure all loaded tournaments have a 'matches' array
    initialData = initialData.map(t => ({
        ...t,
        matches: t.matches || [] // Default to empty array if missing
    }));

    const { subscribe, set, update } = writable<Tournament[]>(initialData);

    subscribe((value) => {
        if (browser) {
            try {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(value));
            } catch {
                // ignore
            }
        }
    });

    return {
        subscribe,
        
        // 1. Modified addTournament to load defaults
        addTournament(payload: { name: string; roundRobin: boolean; groupCount: number }): string {
            const id = typeof crypto !== "undefined" && (crypto as any).randomUUID
                ? (crypto as any).randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

            // Default hardcoded scoring
            let initialScoring = {
                killPoints: 1,
                positions: Array.from({ length: 20 }, (_, i) => ({
                    place: i + 1,
                    points: 0 
                }))
            };

            // Try to load saved defaults from localStorage
            if (browser) {
                const savedDefaults = localStorage.getItem(DEFAULTS_KEY);
                if (savedDefaults) {
                    try {
                        initialScoring = JSON.parse(savedDefaults);
                    } catch (e) {
                        console.error("Failed to parse scoring defaults", e);
                    }
                }
            }

            const t: Tournament = {
                id,
                name: payload.name,
                roundRobin: payload.roundRobin,
                groupCount: payload.groupCount,
                teams: [],
                matches: [],
                createdAt: new Date().toISOString(),
                scoring: initialScoring // Use the loaded or default scoring
            };

            update((list) => [t, ...list]);
            return id;
        },

        // 2. New function to save current scoring as default
        saveDefaultScoring(scoring: { killPoints: number; positions: { place: number; points: number }[] }) {
            if (browser) {
                try {
                    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(scoring));
                } catch (e) {
                    console.error("Failed to save scoring defaults", e);
                }
            }
        },

        addTeam(
            tournamentId: string,
            team: Omit<Team, "id" | "number">
        ): { ok: boolean; id?: string; error?: string } {
            let createdId = "";
            let errorMsg = "";

            update((list) => {
                const idx = list.findIndex((t) => t.id === tournamentId);
                if (idx === -1) {
                    errorMsg = "Tournament not found";
                    return list;
                }
                const t = list[idx];

                // Logic to enforce group assignment
                const group = t.roundRobin ? (team.group || "A") : null;

                const number = t.teams.length + 1;
                createdId = typeof crypto !== "undefined" && (crypto as any).randomUUID
                    ? (crypto as any).randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

                const newTeam: Team = {
                    id: createdId,
                    number,
                    name: team.name,
                    tag: team.tag,
                    logo: team.logo,
                    group,
                    players: team.players,
                };

                const next = [...list];
                next[idx] = { ...t, teams: [...t.teams, newTeam] };
                return next;
            });

            if (!createdId) return { ok: false, error: errorMsg || "Failed to create ID" };
            return { ok: true, id: createdId };
        },

        removeTeam(tournamentId: string, teamId: string) {
            update((list) => {
                const idx = list.findIndex((t) => t.id === tournamentId);
                if (idx === -1) return list;
                const t = list[idx];
                const filtered = t.teams.filter((x) => x.id !== teamId);
                const next = [...list];
                next[idx] = { ...t, teams: filtered };
                return next;
            });
        },

        removeTournament(id: string) {
             update((list) => list.filter((t) => t.id !== id));
        },

        saveMatch(tournamentId: string, matchId: number, results: MatchResult[]) {
            update((list) => {
                const idx = list.findIndex(t => t.id === tournamentId);
                if (idx === -1) return list;
                
                const t = list[idx];
                // Safety: ensure matches array exists
                const currentMatches = t.matches || [];
                
                const existingMatchIndex = currentMatches.findIndex(m => m.id === matchId);
                
                let updatedMatches = [...currentMatches];

                if (existingMatchIndex >= 0) {
                    // Update
                    updatedMatches[existingMatchIndex] = {
                        ...updatedMatches[existingMatchIndex],
                        results: results
                    };
                } else {
                    // Create
                    updatedMatches.push({
                        id: matchId,
                        name: `Match ${matchId}`,
                        results: results
                    });
                }
                
                // Keep matches sorted
                updatedMatches.sort((a, b) => a.id - b.id);

                const next = [...list];
                next[idx] = { ...t, matches: updatedMatches };
                return next;
            });
        },

        updateKillPoints(id: string, value: number) {
            update(list => list.map(t => t.id === id ? { ...t, scoring: { ...t.scoring, killPoints: value } } : t));
        },

        updatePositionPoints(id: string, positions: { place: number; points: number }[]) {
            update(list => list.map(t => t.id === id ? { ...t, scoring: { ...t.scoring, positions } } : t));
        }

    } as const;
}

export const tournamentStore = createTournamentStore();