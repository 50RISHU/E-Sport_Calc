<script lang="ts">
	import type { Tournament } from '$lib/stores/tournamentStore';
	import TeamCard from '$lib/components/TeamCard.svelte';
	import { tournamentStore } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';

	let { tournament } = $props<{ tournament: Tournament }>();

	function deleteTeam(id: string) {
		if(confirm("Delete this team?")) tournamentStore.removeTeam(tournament.id, id);
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center gap-3">
		<h2 class="text-2xl font-['Rajdhani'] font-bold text-white uppercase tracking-wider">
			Deployed Units <span class="text-gray-600">({tournament.teams.length})</span>
		</h2>
		
		<button 
			onclick={() => goto(`/tournament/${tournament.id}/teams`)}
			class="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"
		>
			<i class="bi bi-plus-lg"></i> Add New Team
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each tournament.teams as team, i (team.id)}
			<TeamCard 
				{team} 
				index={i} 
				showGroup={tournament.roundRobin} 
				ondelete={deleteTeam}
			/>
		{/each}

		{#if tournament.teams.length === 0}
			<div class="col-span-full py-12 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500">
				<i class="bi bi-people text-4xl mb-2"></i>
				<p class="text-sm font-mono uppercase">No Teams Registered</p>
			</div>
		{/if}
	</div>
</div>