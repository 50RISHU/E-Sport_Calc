<script lang="ts">
	let { rank, points = $bindable() } = $props<{
		rank: number;
		points: number;
	}>();
</script>

<div 
	class="flex flex-col items-center p-3 bg-white/2 hover:bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
>
	<div class="absolute top-0 right-0 text-[40px] font-black text-white/2 pointer-events-none font-['Rajdhani'] -translate-y-2 translate-x-2">
		#{rank}
	</div>

	<span class="text-[10px] font-bold text-cyan-600 mb-2 font-mono tracking-widest">
		RANK #{rank}
	</span>

	<input 
		type="number"
		min="0"
		bind:value={points}
		class="w-full px-2 py-2 rounded bg-black/50 border border-white/10 text-center text-white font-bold font-['Rajdhani'] text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-700"
	/>
</div>