<script lang="ts">
	import { goto } from '$app/navigation';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';

	let tournamentName = '';
	let roundRobin = false;
	let groupCount = 2;
	let session: Session | null = null;
	let loading = true;

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();

		if (error || !data.session) {
			goto('/login');
			return;
		}

		session = data.session;
		loading = false;
	});

	// preview (optional)
	let tournaments: Tournament[] = [];
	const unsubscribe = tournamentStore.subscribe((v) => (tournaments = v));
	onDestroy(unsubscribe);

	const increaseGroup = () => {
		if (groupCount < 10) groupCount++;
	};

	const decreaseGroup = () => {
		if (groupCount > 2) groupCount--;
	};

	// FIX: Added 'async' keyword here
	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!tournamentName.trim()) {
			alert('Tournament name is required');
			return;
		}

		// FIX: Added 'await' keyword here to resolve the Promise into a real ID string
		const newId = await tournamentStore.addTournament({
			name: tournamentName.trim(),
			roundRobin,
			groupCount
		});

		console.log(newId); // Now this will print the actual ID like "123-abc..."

		// clear local fields
		tournamentName = '';
		roundRobin = false;
		groupCount = 2;

		// navigate to points
		// FIX: Only navigate if we actually got an ID back
		if (newId) {
			goto(`/tournament/${newId}/points`);
		}
	};

	onMount(() => {
		// nothing special; subscription is handled above
	});
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div
	class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"
></div>
<div
	class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"
></div>
<div
	class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"
></div>

<div
	class="min-h-screen text-slate-200 p-4 md:p-8 flex flex-col items-center justify-center font-['Inter'] relative overflow-hidden"
>
	<div class="mb-8 text-center" in:fly={{ y: -20, duration: 500 }}>
		<h2
			class="text-4xl md:text-5xl font-black text-white font-['Rajdhani'] uppercase tracking-wider drop-shadow-lg"
		>
			Initialize <span
				class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
				>Event</span
			>
		</h2>
		<div
			class="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-2"
		></div>
	</div>

	<div
		class="w-full max-w-xl bg-[#0E0E10]/80 backdrop-blur-md rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] border border-white/10 p-6 md:p-10 relative overflow-hidden group"
		in:fly={{ y: 20, duration: 500, delay: 100 }}
	>
		<div
			class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
		></div>

		<form on:submit={handleSubmit} class="space-y-8 relative z-10">
			<div class="space-y-2 group/input">
				<label class="text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono"
					>Tournament Designation</label
				>
				<input
					type="text"
					bind:value={tournamentName}
					required
					placeholder="ENTER TOURNAMENT NAME"
					class="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all font-['Rajdhani'] font-bold text-lg tracking-wide uppercase"
				/>
			</div>

			<div
				class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer"
				on:click={() => (roundRobin = !roundRobin)}
			>
				<div class="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" bind:checked={roundRobin} class="sr-only peer" />
					<div
						class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"
					></div>
				</div>
				<label
					class="text-sm font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none"
					>Enable Round Robin Protocol</label
				>
			</div>

			{#if roundRobin}
				<div
					transition:slide
					class="rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-6 relative overflow-hidden"
				>
					<div class="absolute top-0 right-0 p-2 opacity-10">
						<i class="bi bi-grid-3x3-gap-fill text-4xl text-cyan-500"></i>
					</div>

					<p
						class="text-xs font-bold text-cyan-400 mb-4 uppercase tracking-widest font-mono border-b border-cyan-500/20 pb-2"
					>
						Group Configuration
					</p>

					<div class="flex items-center justify-between gap-4">
						<button
							type="button"
							on:click={decreaseGroup}
							class="w-12 h-12 flex items-center justify-center rounded-lg bg-black/40 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white text-xl transition-all active:scale-95 disabled:opacity-50"
						>
							<i class="bi bi-dash-lg"></i>
						</button>

						<div class="text-center">
							<p class="text-4xl font-black text-white font-['Rajdhani']">{groupCount}</p>
							<p class="text-[10px] text-gray-500 uppercase tracking-widest">Active Groups</p>
						</div>

						<button
							type="button"
							on:click={increaseGroup}
							class="w-12 h-12 flex items-center justify-center rounded-lg bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 text-white text-xl transition-all active:scale-95"
						>
							<i class="bi bi-plus-lg"></i>
						</button>
					</div>

					<div class="mt-6 flex flex-wrap justify-center gap-2">
						{#each Array(groupCount) as _, i}
							<div
								class="w-8 h-8 flex items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]"
							>
								{String.fromCharCode(65 + i)}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<button
				class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-500 hover:from-cyan-600 hover:to-cyan-400 text-white font-black font-['Rajdhani'] text-xl tracking-[0.15em] shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 relative overflow-hidden group"
			>
				<span class="relative z-10">INITIALIZE</span>
				<div
					class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
				></div>
			</button>
		</form>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center h-64 space-y-4">
			<div
				class="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"
			></div>
			<span class="text-cyan-500 font-mono text-xs animate-pulse tracking-widest"
				>LOADING TACTICAL DATA...</span
			>
		</div>
	{:else}
		<div class="mt-8 w-full max-w-xl space-y-2 opacity-50 hover:opacity-100 transition-opacity">
			<p class="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-2">
				// Recent System Entries
			</p>
			<div class="space-y-1">
				{#each tournaments.slice(0, 3) as t}
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono text-gray-400"
					>
						<strong class="text-cyan-600">{t.name}</strong>
						<span>{t.teams.length} UNITS DEPLOYED</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
