<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Tournament, Team } from '$lib/stores/tournamentStore';

	let { 
		tournament, 
		onclose, 
		onnavigateteams, 
		onnavigatepoints 
	} = $props<{
		tournament: Tournament;
		onclose?: () => void;
		onnavigateteams?: (id: string) => void;
		onnavigatepoints?: (id: string) => void;
	}>();
</script>

<div 
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-default"
	onclick={onclose}
	transition:fade={{ duration: 200 }}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Escape' && onclose?.()}
>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div 
		class="bg-[#121214] border border-white/10 w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden cursor-auto"
		onclick={(e) => e.stopPropagation()} 
		in:fly={{ y: 20, duration: 300 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="h-1 w-full bg-linear-to-r from-cyan-600 to-purple-600"></div>

		<div class="p-8">
			<div class="flex justify-between items-start mb-6">
				<div>
					<h2 class="text-3xl font-bold text-white font-['Rajdhani']">{tournament.name}</h2>
					<p class="text-[10px] text-gray-500 font-bold uppercase mt-1">Total Teams: {tournament.teams.length}</p>
				</div>
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button onclick={onclose} class="text-gray-500 hover:text-white transition">
					<i class="bi bi-x-lg"></i>
				</button>
			</div>

			<div class="bg-black/30 rounded border border-white/5 p-4 mb-6">
				<div class="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
					<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Roster</h3>
				</div>
				
				<div class="max-h-60 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
					{#if tournament.roundRobin}
						{#each Array(tournament.groupCount) as _, i}
							{@const groupLabel = String.fromCharCode(65 + i)}
							{@const groupTeams = tournament.teams.filter((t: Team) => t.group === groupLabel)}
							
							<div class="mb-4 last:mb-0">
								<div class="text-[10px] font-bold text-cyan-600 uppercase mb-2 pl-1">Group {groupLabel}</div>
								{#if groupTeams.length > 0}
									{#each groupTeams as team}
										<div class="flex items-center gap-3 text-sm py-1 pl-2 border-l border-white/5">
											<span class="text-gray-300 font-medium">{team.name}</span>
										</div>
									{/each}
								{:else}
									<div class="text-gray-700 text-xs italic pl-2">Empty Group</div>
								{/if}
							</div>
						{/each}
					{:else}
						{#if tournament.teams.length > 0}
							{#each tournament.teams as team, i}
								<div class="flex justify-between items-center text-sm py-1">
									<div class="flex items-center gap-3">
										<span class="text-gray-600 font-mono text-xs">{(i+1).toString().padStart(2,'0')}</span>
										<span class="text-gray-300 font-medium">{team.name}</span>
									</div>
								</div>
							{/each}
						{:else}
							<div class="text-gray-600 text-sm italic py-2 text-center">No teams registered.</div>
						{/if}
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<button 
					onclick={() => onnavigateteams?.(tournament.id)}
					class="w-full py-3 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold uppercase tracking-widest rounded shadow-lg transition-all text-xs flex items-center justify-center gap-2"
				>
					<i class="bi bi-person-plus-fill text-sm"></i> Add / Manage Teams
				</button>

				<div class="grid grid-cols-2 gap-3">
					<button 
						onclick={() => onnavigatepoints?.(tournament.id)}
						class="py-3 bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest rounded shadow-lg transition-all text-xs"
					>
						Manage Points
					</button>
					<button 
						onclick={onclose}
						class="py-3 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest rounded transition-all text-xs"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>