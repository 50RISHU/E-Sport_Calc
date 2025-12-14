<script lang="ts">
	import { page } from '$app/stores';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';

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
			// If filtering by specific group, skip teams not in that group
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

		// 3. Convert to Array and Sort
		// Sort Priority: Total Points > Total Kills > Wins
		let sorted = Array.from(map.values()).sort((a, b) => {
			if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
			if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
			return b.wins - a.wins;
		});

		// 4. Assign Ranks
		leaderboard = sorted.map((item, index) => ({ ...item, rank: index + 1 }));
	}

	// Helper for Group Buttons
	$: groupLabels = tournament?.roundRobin
		? Array.from({ length: tournament.groupCount }, (_, i) => String.fromCharCode(65 + i))
		: [];
</script>

<div class="min-h-screen bg-[#DCD7C9] p-4 pb-20 font-sans">
	{#if tournament}
		<div class="max-w-4xl mx-auto space-y-6">
			
			<div class="text-center space-y-2 mb-6">
				<h1 class="text-3xl font-black text-[#3D2C2E] uppercase tracking-wide">{tournament.name}</h1>
				<p class="text-[#A27B5C] font-bold text-sm tracking-widest">OFFICIAL STANDINGS</p>
			</div>

			{#if tournament.roundRobin}
				<div class="flex flex-wrap justify-center gap-2 mb-4">
					<button
						class="px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm
						{activeFilter === 'Overall' ? 'bg-[#3D2C2E] text-white scale-105' : 'bg-white text-gray-600 hover:bg-gray-100'}"
						on:click={() => activeFilter = 'Overall'}
					>
						Overall
					</button>
					{#each groupLabels as grp}
						<button
							class="px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm
							{activeFilter === grp ? 'bg-[#A27B5C] text-white scale-105' : 'bg-white text-gray-600 hover:bg-gray-100'}"
							on:click={() => activeFilter = grp}
						>
							Group {grp}
						</button>
					{/each}
				</div>
			{/if}

			<div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#A27B5C]/20">
				
				<div class="grid grid-cols-12 bg-[#3D2C2E] text-[#DCD7C9] text-xs md:text-sm font-bold py-3 px-2 md:px-4 uppercase tracking-wider items-center">
					<div class="col-span-1 text-center">#</div>
					<div class="col-span-4 md:col-span-5 pl-2">Team</div>
					<div class="col-span-1 text-center hidden md:block" title="Matches Played">M</div>
					<div class="col-span-1 text-center" title="Chicken Dinners (Wins)">WWCD</div>
					<div class="col-span-2 md:col-span-1 text-center" title="Total Kills">Kills</div>
					<div class="col-span-3 text-right pr-2 md:pr-4 text-white">Total Pts</div>
				</div>

				<div class="divide-y divide-gray-100">
					{#each leaderboard as row (row.teamId)}
						{@const isTop3 = row.rank <= 3}
						{@const rankColor = row.rank === 1 ? 'bg-yellow-400 text-yellow-900' : row.rank === 2 ? 'bg-gray-300 text-gray-800' : row.rank === 3 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}

						<div 
							class="grid grid-cols-12 items-center py-3 px-2 md:px-4 text-sm hover:bg-[#F6E6C9]/20 transition-colors relative"
							in:slide|local
						>
							<div class="col-span-1 flex justify-center">
								<span class="{rankColor} w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full font-bold text-xs md:text-sm shadow-sm">
									{row.rank}
								</span>
							</div>

							<div class="col-span-4 md:col-span-5 pl-2 flex items-center gap-2 md:gap-3 overflow-hidden">
								{#if row.teamLogo}
									<img src={row.teamLogo} alt="logo" class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
								{:else}
									<div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
										{row.teamTag || '?'}
									</div>
								{/if}
								<div class="flex flex-col truncate">
									<span class="font-bold text-[#3D2C2E] truncate text-xs md:text-base">{row.teamName}</span>
									{#if row.group && activeFilter === 'Overall'}
										<span class="text-[10px] text-[#A27B5C] font-semibold">Grp {row.group}</span>
									{/if}
								</div>
							</div>

							<div class="col-span-1 text-center font-medium text-gray-600 hidden md:block">
								{row.matchesPlayed}
							</div>

							<div class="col-span-1 text-center font-bold text-[#3D2C2E]">
								{#if row.wins > 0}
									<div class="flex items-center justify-center gap-1">
										<span class="text-yellow-600">★</span> {row.wins}
									</div>
								{:else}
									<span class="text-gray-300">-</span>
								{/if}
							</div>

							<div class="col-span-2 md:col-span-1 text-center font-semibold text-gray-700">
								{row.totalKills}
							</div>

							<div class="col-span-3 text-right pr-2 md:pr-4">
								<span class="text-lg md:text-xl font-black text-[#A27B5C]">{row.totalPoints}</span>
								<span class="text-[10px] text-gray-400 block -mt-1">pts</span>
							</div>

						</div>
					{/each}

					{#if leaderboard.length === 0}
						<div class="p-8 text-center text-gray-400 italic">
							No matches played yet, or no teams in this group.
						</div>
					{/if}
				</div>
			</div>

			<div class="flex justify-center mt-6">
				<a href={`/dashboard`} class="text-[#A27B5C] font-bold text-sm hover:underline">
					Back to Dashboard
				</a>
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-[80vh] text-gray-500 font-medium animate-pulse">
			Generating Leaderboard...
		</div>
	{/if}
</div>