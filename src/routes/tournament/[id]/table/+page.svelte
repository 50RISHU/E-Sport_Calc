<script lang="ts">
	import { page } from '$app/stores';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { onDestroy } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';

	// --- STATE ---
	let tournament: Tournament | null = null;
	let activeFilter: 'Overall' | string = 'Overall';

	// --- TYPES ---
	interface LeaderboardRow {
		rank: number;
		teamId: string;
		teamName: string;
		teamTag: string;
		teamLogo: string | null;
		group: string | null;
		matchesPlayed: number;
		wins: number; // Chicken Dinners (#1)
		totalKills: number;
		placePoints: number;
		killPoints: number;
		totalPoints: number;
	}

	let leaderboard: LeaderboardRow[] = [];

	// --- STORE SUBSCRIPTION ---
	const unsubscribe = tournamentStore.subscribe((list) => {
		tournament = list.find((t) => t.id === $page.params.id) ?? null;
	});
	onDestroy(unsubscribe);

	// --- CALCULATION LOGIC ---
	$: if (tournament) {
		calculateLeaderboard(tournament, activeFilter);
	}

	function calculateLeaderboard(t: Tournament, filter: string) {
		const map = new Map<string, LeaderboardRow>();

		// 1. Initialize all teams (even those who haven't played)
		t.teams.forEach((team) => {
			if (filter !== 'Overall' && team.group !== filter) return;

			map.set(team.id, {
				rank: 0,
				teamId: team.id,
				teamName: team.name,
				teamTag: team.tag,
				teamLogo: team.logo,
				group: team.group,
				matchesPlayed: 0,
				wins: 0,
				totalKills: 0,
				placePoints: 0,
				killPoints: 0,
				totalPoints: 0
			});
		});

		// 2. Aggregate Match Data
		if (t.matches) {
			t.matches.forEach((match) => {
				match.results.forEach((result) => {
					const row = map.get(result.teamId);
					if (row) {
						row.matchesPlayed += 1;
						row.totalKills += result.kills;
						row.placePoints += result.placePoints;
						row.killPoints += result.killPoints;
						row.totalPoints += result.totalPoints;
						if (result.position === 1) {
							row.wins += 1;
						}
					}
				});
			});
		}

		// 3. Sort
		let sorted = Array.from(map.values()).sort((a, b) => {
			if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
			if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
			return b.wins - a.wins;
		});

		// 4. Assign Ranks
		leaderboard = sorted.map((item, index) => ({ ...item, rank: index + 1 }));
	}

	$: groupLabels = tournament?.roundRobin
		? Array.from({ length: tournament.groupCount }, (_, i) => String.fromCharCode(65 + i))
		: [];
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-6 pb-24 font-['Inter'] selection:bg-cyan-500 selection:text-black">
	{#if tournament}
		<div class="max-w-5xl mx-auto space-y-8">
			
			<div class="text-center space-y-2 mb-8 relative z-10" in:fly={{ y: -20, duration: 500 }}>
				<h1 class="text-4xl md:text-5xl font-black text-white uppercase tracking-widest font-['Rajdhani'] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
					{tournament.name}
				</h1>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
					<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
					<span class="text-xs font-bold text-cyan-400 font-mono tracking-widest uppercase">Official Standings</span>
				</div>
			</div>

			{#if tournament.roundRobin}
				<div class="flex flex-wrap justify-center gap-3 mb-6 relative z-10">
					<button
						class="px-6 py-2 rounded-lg font-bold text-sm transition-all border border-white/5 uppercase tracking-wider font-['Rajdhani']
						{activeFilter === 'Overall' 
							? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] border-cyan-400' 
							: 'bg-[#0E0E10] text-gray-500 hover:text-white hover:bg-white/5'}"
						on:click={() => activeFilter = 'Overall'}
					>
						Overall
					</button>
					{#each groupLabels as grp}
						<button
							class="px-6 py-2 rounded-lg font-bold text-sm transition-all border border-white/5 uppercase tracking-wider font-['Rajdhani']
							{activeFilter === grp 
								? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border-purple-400' 
								: 'bg-[#0E0E10] text-gray-500 hover:text-white hover:bg-white/5'}"
							on:click={() => activeFilter = grp}
						>
							Group {grp}
						</button>
					{/each}
				</div>
			{/if}

			<div 
				class="bg-[#0E0E10]/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative"
				in:fly={{ y: 20, duration: 500, delay: 100 }}
			>
				<div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

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
						{@const isTop3 = row.rank <= 3}
						{@const rankColor = row.rank === 1 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50' : row.rank === 2 ? 'text-gray-300 bg-white/10 border-white/30' : row.rank === 3 ? 'text-orange-400 bg-orange-400/10 border-orange-400/50' : 'text-gray-500 bg-white/5 border-transparent'}
						{@const rowGlow = row.rank === 1 ? 'shadow-[inset_0_0_20px_rgba(250,204,21,0.05)]' : ''}

						<div 
							class="grid grid-cols-12 items-center py-4 px-2 md:px-6 text-sm hover:bg-white/[0.02] transition-colors relative group {rowGlow}"
							in:slide|local
						>
							<div class="col-span-1 flex justify-center">
								<span class="{rankColor} w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded border font-bold font-['Rajdhani'] text-xs md:text-sm shadow-sm transition-all group-hover:scale-110">
									{row.rank}
								</span>
							</div>

							<div class="col-span-4 md:col-span-5 pl-2 flex items-center gap-3 overflow-hidden">
								{#if row.teamLogo}
									<img src={row.teamLogo} alt="logo" class="w-8 h-8 md:w-10 md:h-10 rounded bg-black/50 object-cover border border-white/10" />
								{:else}
									<div class="w-8 h-8 md:w-10 md:h-10 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white/5 font-mono">
										{row.teamTag || '?'}
									</div>
								{/if}
								<div class="flex flex-col truncate">
									<span class="font-bold text-white truncate text-xs md:text-base font-['Rajdhani'] tracking-wide group-hover:text-cyan-400 transition-colors">{row.teamName}</span>
									{#if row.group && activeFilter === 'Overall'}
										<span class="text-[9px] text-gray-500 font-mono">GRP {row.group}</span>
									{/if}
								</div>
							</div>

							<div class="col-span-1 text-center font-mono text-gray-500 text-xs hidden md:block">
								{row.matchesPlayed}
							</div>

							<div class="col-span-1 text-center font-bold text-white">
								{#if row.wins > 0}
									<div class="flex items-center justify-center gap-1">
										<span class="text-yellow-500 text-xs">★</span> <span class="font-mono text-sm">{row.wins}</span>
									</div>
								{:else}
									<span class="text-gray-700 text-xs">-</span>
								{/if}
							</div>

							<div class="col-span-2 md:col-span-1 text-center font-bold text-red-400 font-mono">
								{row.totalKills}
							</div>

							<div class="col-span-3 text-right pr-2 md:pr-4">
								<span class="text-lg md:text-xl font-black text-cyan-400 font-['Rajdhani']">{row.totalPoints}</span>
							</div>

						</div>
					{/each}

					{#if leaderboard.length === 0}
						<div class="p-12 text-center flex flex-col items-center justify-center gap-3">
							<i class="bi bi-database-x text-4xl text-gray-800"></i>
							<p class="text-gray-600 font-mono text-xs uppercase tracking-widest">No combat data available</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex justify-center mt-8">
				<a 
					href={`/dashboard`} 
					class="px-6 py-3 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2"
				>
					<i class="bi bi-arrow-left"></i> Return to Base
				</a>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-[80vh] gap-4">
			<div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
			<p class="text-cyan-500 font-mono text-xs animate-pulse tracking-widest uppercase">Calculating Standings...</p>
		</div>
	{/if}
</div>