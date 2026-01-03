<script lang="ts">
	import { page } from '$app/stores';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import LeaderboardRow from '$lib/components/LeaderboardRow.svelte';

	// --- TYPES ---
	interface LeaderboardItem {
		rank: number;
		teamId: string;
		teamName: string;
		teamTag: string;
		teamLogo: string | null;
		group: string | null;
		matchesPlayed: number;
		wins: number;
		totalKills: number;
		totalPoints: number;
	}

	// --- STATE ---
	let tournamentId: string = $page.params.id ?? '';
	let tournament: Tournament | null = $state(null);
	
	// FILTERS
	let activeGroupFilter = $state('All'); // 'All' or 'A', 'B'...
	let activeMatchFilter: 'overall' | number = $state('overall'); // 'overall' or 1, 2, 3...
	
	let loading = $state(true);

	// --- AUTH & LOAD ---
	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) {
			goto('/login');
			return;
		}
		
		if ($tournamentStore.length === 0) {
			await tournamentStore.loadTournaments();
		}
		loading = false;
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === tournamentId);
		if (found) tournament = found;
	});
	onDestroy(unsubscribe);

	// --- LEADERBOARD CALCULATION ENGINE ---
	const leaderboard = $derived.by(() => {
		if (!tournament) return [];

		const statsMap = new Map<string, LeaderboardItem>();

		// 1. Initialize Teams (Based on Group Filter)
		tournament.teams.forEach(t => {
			if (activeGroupFilter !== 'All' && t.group !== activeGroupFilter) return;

			statsMap.set(t.id, {
				rank: 0,
				teamId: t.id,
				teamName: t.name,
				teamTag: t.tag || '',
				teamLogo: t.logo || null,
				group: t.group || null,
				matchesPlayed: 0,
				wins: 0,
				totalKills: 0,
				totalPoints: 0
			});
		});

		// 2. Process Matches (Based on Match Filter)
		if (tournament.matches) {
			const matchesToProcess = activeMatchFilter === 'overall' 
				? tournament.matches // Use ALL matches
				: tournament.matches.filter(m => m.matchId === activeMatchFilter); // Use ONE match

			for (const match of matchesToProcess) {
				for (const res of match.results) {
					const teamStats = statsMap.get(res.teamId);
					
					if (teamStats) {
						teamStats.matchesPlayed++;
						teamStats.totalKills += res.kills;
						teamStats.totalPoints += res.totalPoints;
						if (res.place === 1) teamStats.wins++;
					}
				}
			}
		}

		// 3. Sort & Rank
		return Array.from(statsMap.values())
			.sort((a, b) => {
				if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
				if (b.wins !== a.wins) return b.wins - a.wins;
				return b.totalKills - a.totalKills;
			})
			.map((item, index) => ({ ...item, rank: index + 1 }));
	});

	// Derived: Group Labels for UI
	const groupLabels = $derived.by(() => {
		if (!tournament || !tournament.roundRobin) return [];
		return Array.from({ length: tournament.groupCount }, (_, i) => String.fromCharCode(65 + i));
	});

	// FIX APPLIED HERE: Safe Derived Match IDs
	const matchIds = $derived.by(() => {
		if (!tournament || !tournament.matches) return [];
		return tournament.matches.map(m => m.matchId).sort((a, b) => a - b);
	});
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-6 pb-24 font-['Inter'] selection:bg-cyan-500 selection:text-black">
	{#if tournament && !loading}
		<div class="max-w-5xl mx-auto space-y-6">
			
			<div class="text-center space-y-2 mb-8 relative z-10" in:fly={{ y: -20, duration: 500 }}>
				<h1 class="text-4xl md:text-5xl font-black text-white uppercase tracking-widest font-['Rajdhani'] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
					{tournament.name}
				</h1>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
					<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
					<span class="text-xs font-bold text-cyan-400 font-mono tracking-widest uppercase">Official Standings</span>
				</div>
			</div>

			<div class="flex flex-col gap-4 relative z-10">
				
				<div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar justify-center">
					<button
						class="px-5 py-2 rounded-lg font-bold text-xs transition-all border uppercase tracking-widest font-['Rajdhani'] whitespace-nowrap
						{activeMatchFilter === 'overall' 
							? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40' 
							: 'bg-[#0E0E10] text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}"
						onclick={() => activeMatchFilter = 'overall'}
					>
						Overall
					</button>
					
					{#each matchIds as mId}
						<button
							class="px-5 py-2 rounded-lg font-bold text-xs transition-all border uppercase tracking-widest font-['Rajdhani'] whitespace-nowrap
							{activeMatchFilter === mId 
								? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40' 
								: 'bg-[#0E0E10] text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}"
							onclick={() => activeMatchFilter = mId}
						>
							Match {mId}
						</button>
					{/each}

					{#if matchIds.length === 0}
						<span class="text-xs text-gray-600 font-mono px-3">NO MATCHES YET</span>
					{/if}
				</div>

				{#if tournament.roundRobin}
					<div class="flex flex-wrap justify-center gap-2">
						<button
							class="px-4 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest transition-all
							{activeGroupFilter === 'All' 
								? 'bg-white/10 text-white border-white/30' 
								: 'text-gray-600 border-transparent hover:text-gray-400'}"
							onclick={() => activeGroupFilter = 'All'}
						>
							All Groups
						</button>
						{#each groupLabels as grp}
							<button
								class="px-4 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest transition-all
								{activeGroupFilter === grp 
									? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
									: 'text-gray-600 border-transparent hover:text-gray-400'}"
								onclick={() => activeGroupFilter = grp}
							>
								Group {grp}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div 
				class="bg-[#0E0E10]/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative"
				in:fly={{ y: 20, duration: 500, delay: 100 }}
			>
				<div class="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>
				
				<div class="bg-black/40 px-6 py-2 border-b border-white/5 flex justify-between items-center">
					<span class="text-[10px] font-bold font-mono text-gray-500 uppercase tracking-widest">
						VIEW: <span class="text-white">{activeMatchFilter === 'overall' ? 'OVERALL STANDINGS' : `MATCH ${activeMatchFilter} RESULT`}</span>
					</span>
					{#if activeMatchFilter !== 'overall'}
						<span class="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">SINGLE MATCH MODE</span>
					{/if}
				</div>

				<div class="grid grid-cols-12 bg-black/40 text-gray-400 text-[10px] md:text-xs font-bold py-4 px-2 md:px-6 uppercase tracking-widest border-b border-white/5 font-mono">
					<div class="col-span-1 text-center">#</div>
					<div class="col-span-4 md:col-span-5 pl-2">Unit / Squad</div>
					<div class="col-span-1 text-center hidden md:block" title="Matches Played">M</div>
					<div class="col-span-1 text-center" title="Chicken Dinners (Wins)">Win</div>
					<div class="col-span-2 md:col-span-1 text-center text-red-400" title="Total Kills">Kills</div>
					<div class="col-span-3 text-right pr-2 md:pr-4 text-cyan-400">Pts</div>
				</div>

				<div class="divide-y divide-white/5">
					{#each leaderboard as row (row.teamId)}
						<LeaderboardRow 
							rank={row.rank}
							teamName={row.teamName}
							teamTag={row.teamTag}
							teamLogo={row.teamLogo}
							group={row.group}
							matches={row.matchesPlayed}
							wins={row.wins}
							kills={row.totalKills}
							points={row.totalPoints}
							showGroup={activeGroupFilter === 'All'}
						/>
					{/each}

					{#if leaderboard.length === 0}
						<div class="p-12 text-center flex flex-col items-center justify-center gap-3">
							<i class="bi bi-database-x text-4xl text-gray-800"></i>
							<p class="text-gray-600 font-mono text-xs uppercase tracking-widest">No combat data available</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-[80vh] gap-4">
			<div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
			<p class="text-cyan-500 font-mono text-xs animate-pulse tracking-widest uppercase">Calculating Standings...</p>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { height: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
</style>