<script lang="ts">
	import { goto } from '$app/navigation';
	import { tournamentStore } from '$lib/stores/tournamentStore';
	import { onMount } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';

	let tournamentName = '';
	let roundRobin = false;
	let groupCount = 2;
	let submitting = false;

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) {
			goto('/login');
		}
	});

	// --- HANDLERS ---

	const updateGroupCount = (increment: boolean) => {
		if (increment && groupCount < 10) groupCount++;
		if (!increment && groupCount > 2) groupCount--;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		
		if (!tournamentName.trim()) {
			alert('Tournament name is required');
			return;
		}

		submitting = true;

		// 1. Create Tournament
		const newId = await tournamentStore.addTournament({
			name: tournamentName.trim(),
			roundRobin,
			groupCount
		});

		submitting = false;

		// 2. Redirect on Success
		if (newId) {
			goto(`/tournament/${newId}/teams`); // Go to Add Teams first usually
		}
	};
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl -z-40 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center  font-['Inter'] relative overflow-hidden">
	<div class="mb-8 text-center" in:fly={{ y: -20, duration: 500 }}>
		<h2 class="text-3xl md:text-5xl font-black text-white font-['Rajdhani'] uppercase tracking-wider drop-shadow-lg">
			Initialize <span class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500">Event</span>
		</h2>
		<div class="h-1 w-24 bg-linear-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-2"></div>
	</div>

	<div 
		class="w-full max-w-lg bg-[#0E0E10]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-10 relative overflow-hidden"
		in:fly={{ y: 20, duration: 500, delay: 100 }}
	>
		<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>

		<form onsubmit={handleSubmit} class="space-y-6 relative z-10">
			
			<div class="space-y-2">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono">Tournament Designation</label>
				<input
					type="text"
					bind:value={tournamentName}
					required
					placeholder="Enter Tournament Name" 
					class="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-['Rajdhani'] font-bold text-lg tracking-wide"
				/>
			</div>

			<div
				class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer group"
				onclick={() => (roundRobin = !roundRobin)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && (roundRobin = !roundRobin)}
			>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="text-sm font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none group-hover:text-white transition-colors">
					Enable Round Robin
				</label>
				<div class="relative inline-flex items-center cursor-pointer pointer-events-none">
					<div class={`w-11 h-6 rounded-full peer transition-colors ${roundRobin ? 'bg-cyan-600' : 'bg-gray-700'}`}></div>
					<div class={`absolute top-0.5 left-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-all transform ${roundRobin ? 'translate-x-full border-white' : ''}`}></div>
				</div>
			</div>

			{#if roundRobin}
				<div transition:slide class="rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-5 relative overflow-hidden">
					<div class="flex items-center justify-between gap-4">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							type="button"
							onclick={() => updateGroupCount(false)}
							class="w-10 h-10 flex items-center justify-center rounded-lg bg-black/40 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white text-lg transition-all active:scale-95 disabled:opacity-50"
						>
							<i class="bi bi-dash"></i>
						</button>

						<div class="text-center">
							<p class="text-3xl font-black text-white font-['Rajdhani'] leading-none">{groupCount}</p>
							<p class="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">Groups</p>
						</div>

						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							type="button"
							onclick={() => updateGroupCount(true)}
							class="w-10 h-10 flex items-center justify-center rounded-lg bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-white text-lg transition-all active:scale-95"
						>
							<i class="bi bi-plus-lg"></i>
						</button>
					</div>

					<div class="mt-4 flex flex-wrap justify-center gap-2">
						{#each Array(groupCount) as _, i}
							<div class="w-6 h-6 flex items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
								{String.fromCharCode(65 + i)}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<button
				disabled={submitting}
				class="w-full py-4 rounded-xl bg-linear-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-black font-['Rajdhani'] text-lg tracking-[0.15em] shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
			>
				{#if submitting}
					<span class="animate-pulse">INITIALIZING...</span>
				{:else}
					INITIALIZE
				{/if}
			</button>
		</form>
	</div>
</div>