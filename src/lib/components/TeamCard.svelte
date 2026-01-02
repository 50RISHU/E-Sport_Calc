<script lang="ts">
	import { fly } from "svelte/transition";
	import type { Team } from "$lib/stores/tournamentStore";

	let { 
		team, 
		index, // Passed from parent to show slot number
		showGroup = false, 
		ondelete 
	} = $props<{
		team: Team;
		index: number;
		showGroup?: boolean;
		ondelete?: (id: string) => void;
	}>();
</script>

<div
	transition:fly={{ y: 8, duration: 220 }}
	class="p-3 rounded-xl border border-white/5 bg-[#151518] hover:border-cyan-500/30 transition-all flex items-center justify-between group"
>
	<div class="flex items-center gap-4">
		<div class="font-mono text-xs text-gray-600 font-bold w-6 text-center">
			{(index + 1).toString().padStart(2, '0')}
		</div>

		<div class="relative w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0">
			{#if team.logo}
				<img src={team.logo} alt="logo" class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full flex items-center justify-center text-gray-700">
					<i class="bi bi-shield-shaded"></i>
				</div>
			{/if}
		</div>

		<div>
			<div class="flex items-center gap-2">
				<h4 class="font-bold text-gray-200 font-['Rajdhani'] uppercase tracking-wide leading-none">
					{team.name}
				</h4>
				{#if team.tag}
					<span class="text-[9px] bg-white/5 text-cyan-500 px-1.5 py-0.5 rounded border border-white/5 font-mono font-bold">
						{team.tag}
					</span>
				{/if}
			</div>
			
			<div class="flex items-center gap-2 mt-1">
				<span class="text-[10px] text-gray-500 font-mono">
					{team.players.length} Operatives
				</span>
				{#if showGroup && team.group}
					<span class="text-[9px] text-purple-400 font-bold border border-purple-500/20 px-1 rounded bg-purple-500/10">
						GRP {team.group}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<button 
		onclick={() => ondelete?.(team.id)}
		class="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500/50 hover:text-red-400 hover:bg-red-500/20 transition-all"
		aria-label="Delete Team"
	>
		<i class="bi bi-trash"></i>
	</button>
</div>