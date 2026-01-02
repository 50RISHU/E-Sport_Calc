<script lang="ts">
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import TournamentCard from '$lib/components/TournamentCard.svelte';
	import TournamentDetailsModal from '$lib/components/TournamentDetailsModal.svelte';

	let tournaments: Tournament[] = [];
	let selectedTournament: Tournament | null = null;
	let loading = true;

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) {
			goto('/login');
			return;
		}
		await tournamentStore.loadTournaments();
		loading = false;
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		tournaments = list;
	});

	onDestroy(unsubscribe);

	// Actions
	const addTournament = () => goto('/tournament/create-tournament');

	const handleDelete = async (id: string) => {
		if (confirm('Delete this tournament? This cannot be undone.')) {
			await tournamentStore.removeTournament(id);
		}
	};

	const handleCalculate = (t: Tournament) => {
		goto(`/tournament/${t.id}/calculate-points`);
	};

	const handleOpen = (t: Tournament) => {
		selectedTournament = t;
	};

	const handleNavigateTeams = (id: string) => {
		goto(`/tournament/${id}/teams`);
	};

	const handleNavigatePoints = (id: string) => {
		goto(`/tournament/${id}/points`);
	};
</script>

<div
	class="min-h-screen text-slate-200 p-6 md:p-12 relative font-['Inter'] selection:bg-cyan-500 selection:text-black"
>
	<header
		class="flex flex-col items-start justify-center mb-16 max-w-7xl mx-auto border-b border-white/10 pb-8"
	>
		<div class="flex items-center gap-3 mb-2">
			<div class="h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></div>
			<span class="text-xs font-mono text-cyan-500 tracking-widest">SYSTEM OPERATIONAL</span>
		</div>
		<h1
			class="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase font-['Rajdhani']"
		>
			Esports <span class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500"
				>Calc.</span
			>
		</h1>
		<p class="text-gray-500 max-w-lg mt-2 text-sm md:text-base font-medium">
			Manage competitive events, track kills, and automate scoring.
		</p>
	</header>

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
		<div
			class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pb-20"
		>
			<button
				on:click={addTournament}
				class="group relative h-[200px] md:h-[260px] rounded-xl border border-dashed border-white/10 hover:border-cyan-500/50 bg-white/2 hover:bg-white/4 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 overflow-hidden"
			>
				<div
					class="w-14 h-14 rounded-full bg-[#151518] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-xl relative z-10"
				>
					<i
						class="bi bi-plus-lg text-2xl text-gray-400 group-hover:text-cyan-400 transition-colors"
					></i>
				</div>
				<span
					class="font-['Rajdhani'] font-bold text-lg text-gray-500 group-hover:text-white tracking-widest uppercase relative z-10"
					>Create Event</span
				>
				<div
					class="absolute bottom-5 right-5 text-white/2 group-hover:text-cyan-500/5 transition-all duration-500 rotate-12 z-0"
				>
					<i class="bi bi-joystick text-[100px]"></i>
				</div>
			</button>

			{#each tournaments as t, i (t.id)}
				<TournamentCard
					tournament={t}
					index={i}
					onopen={handleOpen}
					oncalculate={handleCalculate}
					ondelete={handleDelete}
				/>
			{/each}
		</div>
	{/if}

	{#if selectedTournament}
		<TournamentDetailsModal
			tournament={selectedTournament}
			onclose={() => (selectedTournament = null)}
			onnavigateteams={handleNavigateTeams}
			onnavigatepoints={handleNavigatePoints}
		/>
	{/if}
</div>
