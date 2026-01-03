<script lang="ts">
	let { 
		rank, 
		teamName, 
		teamTag, 
		teamLogo, 
		group, 
		matches, 
		wins, 
		kills, 
		points,
		showGroup 
	} = $props<{
		rank: number;
		teamName: string;
		teamTag: string;
		teamLogo: string | null;
		group: string | null;
		matches: number;
		wins: number;
		kills: number;
		points: number;
		showGroup: boolean;
	}>();

	// Visual logic for Top 3
	const rankColor = $derived(
		rank === 1 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/50 shadow-yellow-400/20' : 
		rank === 2 ? 'text-gray-300 bg-white/10 border-white/30' : 
		rank === 3 ? 'text-orange-400 bg-orange-400/10 border-orange-400/50' : 
		'text-gray-500 bg-white/5 border-transparent'
	);

	const rowGlow = $derived(rank === 1 ? 'shadow-[inset_0_0_20px_rgba(250,204,21,0.05)] border-yellow-500/10' : 'border-transparent');
</script>

<div class="grid grid-cols-12 items-center py-4 px-2 md:px-6 text-sm hover:bg-white/2 transition-colors relative group border-b border-white/5 {rowGlow}">
	
	<div class="col-span-1 flex justify-center">
		<span class="{rankColor} w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded border font-bold font-['Rajdhani'] text-xs md:text-sm shadow-sm transition-all group-hover:scale-110">
			{rank}
		</span>
	</div>

	<div class="col-span-4 md:col-span-5 pl-2 flex items-center gap-3 overflow-hidden">
		<div class="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
			{#if teamLogo}
				<img src={teamLogo} alt={teamName} class="w-full h-full rounded bg-black/50 object-cover border border-white/10" loading="lazy" />
			{:else}
				<div class="w-full h-full rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white/5 font-mono">
					{teamTag || '?'}
				</div>
			{/if}
		</div>
		
		<div class="flex flex-col truncate">
			<span class="font-bold text-white truncate text-xs md:text-base font-['Rajdhani'] tracking-wide group-hover:text-cyan-400 transition-colors">
				{teamName}
			</span>
			{#if showGroup && group}
				<span class="text-[9px] text-gray-500 font-mono">GRP {group}</span>
			{/if}
		</div>
	</div>

	<div class="col-span-1 text-center font-mono text-gray-500 text-xs hidden md:block">
		{matches}
	</div>

	<div class="col-span-1 text-center font-bold text-white">
		{#if wins > 0}
			<div class="flex items-center justify-center gap-1">
				<span class="text-yellow-500 text-xs">★</span> <span class="font-mono text-sm">{wins}</span>
			</div>
		{:else}
			<span class="text-gray-700 text-xs">-</span>
		{/if}
	</div>

	<div class="col-span-2 md:col-span-1 text-center font-bold text-red-400 font-mono">
		{kills}
	</div>

	<div class="col-span-3 text-right pr-2 md:pr-4">
		<span class="text-lg md:text-xl font-black text-cyan-400 font-['Rajdhani']">
			{points}
		</span>
	</div>
</div>