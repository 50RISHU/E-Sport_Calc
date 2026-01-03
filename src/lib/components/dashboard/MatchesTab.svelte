<script lang="ts">
	// 1. Import all necessary types
	import type { Tournament, Match, MatchResult, Team } from '$lib/stores/tournamentStore';
	import { tournamentStore } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';

	let { tournament } = $props<{ tournament: Tournament }>();

	async function deleteMatch(matchId: number) {
		if (
			confirm(
				`Are you sure you want to delete Match #${matchId}? This will remove points for all teams in this match.`
			)
		) {
			await tournamentStore.deleteMatch(tournament.id, matchId);
		}
	}

	// 2. Explicitly type every parameter in this helper function
	function getWinnerTeam(match: Match): Team | undefined {
		const winnerEntry = match.results.find((r: MatchResult) => r.place === 1);

		if (!winnerEntry) return undefined;
		return tournament.teams.find((t: Team) => t.id === winnerEntry.teamId);
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center gap-3">
		<h2 class="text-2xl font-['Rajdhani'] font-bold text-white uppercase tracking-wider">
			Combat Log <span class="text-gray-600">({tournament.matches.length})</span>
		</h2>

		<button
			onclick={() => goto(`/tournament/${tournament.id}/calculate-points`)}
			class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
		>
			<i class="bi bi-calculator"></i> Enter Match Data
		</button>
	</div>

	<div class="bg-[#0E0E10] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
		<table class="w-full text-left text-sm text-gray-400 min-w-[600px]">
			<thead
				class="bg-white/5 text-xs uppercase font-bold text-white font-mono border-b border-white/5"
			>
				<tr>
					<th class="px-6 py-4">Match ID</th>
					<th class="px-6 py-4">Entries</th>
					<th class="px-6 py-4">Winner</th>
					<th class="px-6 py-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each tournament.matches as match}
					{@const winnerTeam = getWinnerTeam(match)}

					<tr class="hover:bg-white/2 transition-colors">
						<td class="px-6 py-4 font-mono font-bold text-cyan-500">#{match.matchId}</td>
						<td class="px-6 py-4">{match.results.length} Teams</td>
						<td class="px-6 py-4">
							{#if winnerTeam}
								<span class="text-yellow-500 font-bold flex items-center gap-2">
									<i class="bi bi-trophy-fill"></i>
									{winnerTeam.name}
								</span>
							{:else}
								<span class="text-gray-600">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-right flex items-center justify-end gap-2">
							<button
								class="text-[10px] font-bold text-cyan-500 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/20 px-3 py-1.5 rounded transition-all uppercase"
								onclick={() => goto(`/tournament/${tournament.id}/table`)}
							>
								View Table
							</button>

							<button
								class="text-[10px] font-bold text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500/20 px-3 py-1.5 rounded transition-all uppercase"
								onclick={() => deleteMatch(match.matchId)}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}

				{#if tournament.matches.length === 0}
					<tr>
						<td colspan="4" class="px-6 py-12 text-center text-gray-600 font-mono text-xs"
							>NO MATCH DATA RECORDED</td
						>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
