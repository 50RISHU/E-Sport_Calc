<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Tournament } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';

	// Svelte 5: Use $props() to define data and event callbacks
	let {
		tournament,
		index = 0,
		// Receive functions from parent instead of dispatching
		onopen,
		oncalculate,
		ondelete
	} = $props<{
		tournament: Tournament;
		index?: number;
		// Define types for the callback functions
		onopen?: (t: Tournament) => void;
		oncalculate?: (t: Tournament) => void;
		ondelete?: (id: string) => void;
	}>();
</script>

<div
	in:fly={{ y: 20, duration: 400, delay: index * 50 }}
	class="group relative h-[200px] md:h-[260px] bg-[#0E0E10] border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col"
>
	<div
		class="absolute bottom-5 right-[-15px] text-white/3 group-hover:text-cyan-500/8 pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-0"
	>
		<i class="bi bi-controller text-[100px] md:text-[140px]"></i>
	</div>

	<div class="relative z-10 flex flex-col justify-between h-full p-4 md:p-6">
		<div class="flex justify-between items-start">
			<div class="min-w-0 pr-2">
				<span
					class="text-[9px] md:text-[10px] text-cyan-600 font-mono font-bold tracking-widest mb-0.5 block"
				>
					ID: {tournament.id.slice(0, 4)}
				</span>
				<h3
					class="text-xl md:text-2xl font-bold text-white font-['Rajdhani'] leading-none group-hover:text-cyan-50 transition-colors truncate"
				>
					{tournament.name}
				</h3>
			</div>
			<div
				class="shrink-0 px-1.5 py-0.5 bg-white/5 rounded text-[9px] md:text-[10px] font-bold text-gray-400 border border-white/5 group-hover:border-green-500/30 group-hover:text-green-400 transition-colors shadow-sm"
			>
				ACTIVE
			</div>
		</div>

		<div class="flex gap-4 md:gap-6 my-auto relative">
			<div class="flex flex-col">
				<span class="text-2xl md:text-3xl font-['Rajdhani'] font-bold text-white leading-none"
					>{tournament.teams.length}</span
				>
				<span
					class="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1"
					>Teams</span
				>
			</div>
			<div class="w-px h-6 md:h-8 bg-white/10 self-center"></div>
			<div class="flex flex-col">
				<span class="text-2xl md:text-3xl font-['Rajdhani'] font-bold text-white leading-none"
					>{tournament.roundRobin ? 'RR' : 'STD'}</span
				>
				<span
					class="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1"
					>Format</span
				>
			</div>
		</div>

		<div class="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-white/5">
			<button
				onclick={() => goto(`/tournament/${tournament.id}/dashboard`)}
				class="flex-1 py-1.5 md:py-2 bg-cyan-900/20 hover:bg-cyan-600 text-cyan-400 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded transition-all duration-200"
			>
				Dashboard
			</button>
			<button
				onclick={() => oncalculate?.(tournament)}
				class="flex-1 py-1.5 md:py-2 bg-purple-900/20 hover:bg-purple-600 text-purple-400 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded transition-all duration-200"
			>
				Calc.
			</button>
			<button
				onclick={(e) => {
					e.stopPropagation();
					ondelete?.(tournament.id);
				}}
				class="px-2.5 py-1.5 md:px-3 md:py-2 bg-red-900/10 hover:bg-red-900/30 text-red-500/50 hover:text-red-400 rounded transition-all"
				aria-label="Delete Tournament"
			>
				<i class="bi bi-trash text-sm md:text-base"></i>
			</button>
		</div>
	</div>
</div>
