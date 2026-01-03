<script lang="ts">
	import { fade } from 'svelte/transition';

	// Svelte 5 Props
	let { images = $bindable([]), onUpload } = $props<{
		images: string[];
		onUpload: (files: FileList) => void;
	}>();

	let viewingImage: string | null = $state(null);
	let zoomLevel = $state(1);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			onUpload(input.files);
		}
	}

	function closeViewer() {
		viewingImage = null;
		zoomLevel = 1;
	}

	function zoom(delta: number) {
		const newLevel = zoomLevel + delta;
		if (newLevel >= 0.5 && newLevel <= 3) zoomLevel = newLevel;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeViewer();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="bg-[#0E0E10] p-5 rounded-xl border border-white/5 shadow-lg flex flex-col gap-4 h-full">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
		<i class="bi bi-images text-cyan-500"></i> Evidence
	</label>
	
	<label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all group">
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<i class="bi bi-cloud-upload text-2xl text-gray-600 group-hover:text-cyan-400 mb-2 transition-colors"></i>
			<p class="text-xs text-gray-500 group-hover:text-gray-300">Click to upload screenshot</p>
		</div>
		<input type="file" multiple accept="image/*" onchange={handleFileChange} class="hidden" />
	</label>

	{#if images.length > 0}
		<div class="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
			{#each images as img}
				<button 
					class="aspect-video relative rounded overflow-hidden border border-white/10 group w-full"
					onclick={() => viewingImage = img}
				>
					<img src={img} alt="Evidence" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
					<div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
						<i class="bi bi-zoom-in text-white text-xl"></i>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if viewingImage}
	<div 
		class="fixed inset-0 z-100 bg-black/95 flex flex-col"
		transition:fade={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
	>
		<div class="flex justify-between items-center p-4 bg-black/80 backdrop-blur-sm z-20 border-b border-white/10">
			<h2 class="font-bold text-lg font-['Rajdhani'] text-white uppercase tracking-widest flex items-center gap-2">
				<i class="bi bi-eye text-cyan-500"></i> Visual Intel
			</h2>
			<div class="flex items-center gap-3">
				<div class="flex items-center bg-white/5 rounded-lg border border-white/10">
					<button onclick={() => zoom(-0.5)} class="w-10 h-9 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white" title="Zoom Out"><i class="bi bi-dash"></i></button>
					<span class="w-14 text-center font-mono text-xs text-cyan-500 border-x border-white/10">{Math.round(zoomLevel * 100)}%</span>
					<button onclick={() => zoom(0.5)} class="w-10 h-9 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white" title="Zoom In"><i class="bi bi-plus"></i></button>
				</div>
				<button onclick={closeViewer} class="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
					Close
				</button>
			</div>
		</div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="flex-1 overflow-auto bg-[#050505] flex items-center justify-center p-4 cursor-pointer"
			onclick={closeViewer}
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img 
				src={viewingImage} 
				alt="Zoomed Reference" 
				class="shadow-2xl rounded transition-all duration-200 ease-out cursor-default"
				style="transform: scale({zoomLevel}); max-width: 90%; max-height: 90vh;" 
				onclick={(e) => e.stopPropagation()} 
			/>
		</div>
	</div>
{/if}