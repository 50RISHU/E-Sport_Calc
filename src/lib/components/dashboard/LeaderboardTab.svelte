<script lang="ts">
	import type { Tournament } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';

	let { tournament } = $props<{ tournament: Tournament }>();
</script>

<div class="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl bg-white/1">
	<i class="bi bi-trophy text-4xl text-yellow-500/50 mb-4"></i>
	<h3 class="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-widest mb-2">Tournament Standings</h3>
	<p class="text-gray-500 text-sm mb-6 max-w-md text-center">View the calculated rankings based on kills, placement points, and penalties.</p>
	
	<button 
		onclick={() => goto(`/tournament/${tournament.id}/table`)}
		class="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg shadow-cyan-900/20 transition-all"
	>
		Open Full Leaderboard
	</button>
</div>