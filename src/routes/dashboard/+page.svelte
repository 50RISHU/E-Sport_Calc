<script lang="ts">
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';

	let tournaments: Tournament[] = [];
	let selectedTournament: Tournament | null = null;
	let showModal = false;
	let session: Session | null = null;
	let loading = true;

	onMount(async () => {
		// 1. Check Session
		const { data, error } = await supabase.auth.getSession();

		if (error || !data.session) {
			goto('/login');
			return;
		}

		session = data.session;

		// 2. FETCH DATA (This was missing before)
		// We wait for this to finish before removing the loading screen
		await tournamentStore.loadTournaments();
		
		loading = false;
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		tournaments = list;
	});

	onDestroy(unsubscribe);

	const addTournament = () => goto('/tournament/create-tournament');
	const navigateToPoints = (id: string) => goto(`/tournament/${id}/points`);
	const calculatePoints = (t: Tournament) => goto(`/tournament/${t.id}/calculate-points`);
	
	const deleteTournament = async (id: string) => {
		if (!confirm('Are you sure you want to delete this tournament? This cannot be undone.')) return;
		await tournamentStore.removeTournament(id);
	};

	const openDetails = (t: Tournament) => {
		selectedTournament = t;
		showModal = true;
	};
	
	const closeModal = () => {
		showModal = false;
		selectedTournament = null;
	};
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-6 md:p-12 relative font-['Inter'] selection:bg-cyan-500 selection:text-black">
	
	<header class="flex flex-col items-start justify-center mb-16 max-w-7xl mx-auto border-b border-white/10 pb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></div>
			<span class="text-xs font-mono text-cyan-500 tracking-widest">SYSTEM OPERATIONAL</span>
		</div>
		<h1 class="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase font-['Rajdhani']">
			Esports <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Calc.</span>
		</h1>
		<p class="text-gray-500 max-w-lg mt-2 text-sm md:text-base font-medium">
			Manage competitive events, track kills, and automate scoring with tactical precision.
		</p>
	</header>

	{#if loading}
		<div class="flex flex-col items-center justify-center h-64 space-y-4">
			<div class="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
			<span class="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">LOADING TACTICAL DATA...</span>
		</div>
	{:else}
		<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pb-20">
			
			<button 
				on:click={addTournament}
				class="group relative h-[280px] rounded-xl border border-dashed border-white/10 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center justify-center gap-4 transition-all duration-300 overflow-hidden"
			>
				<div class="w-14 h-14 rounded-full bg-[#151518] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-xl relative z-10">
					<i class="bi bi-plus-lg text-2xl text-gray-400 group-hover:text-cyan-400 transition-colors"></i>
				</div>
				<span class="font-['Rajdhani'] font-bold text-lg text-gray-500 group-hover:text-white tracking-widest uppercase relative z-10">Create Event</span>
				
				<div class="absolute bottom-[-20px] right-[-20px] text-white/[0.02] group-hover:text-cyan-500/[0.05] transition-all duration-500 rotate-12 z-0">
					<i class="bi bi-joystick text-[100px]"></i>
				</div>
			</button>

			{#each tournaments as t, i}
				<div 
					in:fly={{ y: 20, duration: 400, delay: i * 50 }}
					class="group relative h-[280px] bg-[#0E0E10] border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col"
				>
					<div class="absolute bottom-[-30px] right-[-20px] text-white/[0.03] group-hover:text-cyan-500/[0.08] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 z-0">
						<i class="bi bi-controller text-[140px]"></i>
					</div>

					<div class="relative z-10 flex flex-col justify-between h-full p-6">
						<div class="flex justify-between items-start">
							<div>
								<span class="text-[10px] text-cyan-600 font-mono font-bold tracking-widest uppercase mb-1 block">ID: {t.id.slice(0,4)}</span>
								<h3 class="text-2xl font-bold text-white font-['Rajdhani'] leading-tight group-hover:text-cyan-50 transition-colors line-clamp-1">
									{t.name}
								</h3>
							</div>
							<div class="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 border border-white/5 group-hover:border-green-500/30 group-hover:text-green-400 transition-colors shadow-sm">
								ACTIVE
							</div>
						</div>

						<div class="flex gap-6 my-auto relative">
							<div class="flex flex-col">
								<span class="text-3xl font-['Rajdhani'] font-bold text-white">{t.teams.length}</span>
								<span class="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Teams</span>
							</div>
							<div class="w-px h-8 bg-white/10"></div>
							<div class="flex flex-col">
								<span class="text-3xl font-['Rajdhani'] font-bold text-white">{t.roundRobin ? 'RR' : 'STD'}</span>
								<span class="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Format</span>
							</div>
						</div>

						<div class="flex items-center gap-3 pt-4 border-t border-white/5">
							<button 
								on:click={() => openDetails(t)}
								class="flex-1 py-2 bg-cyan-900/20 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-all duration-200"
							>
								Dashboard
							</button>
							<button 
								on:click={() => calculatePoints(t)}
								class="flex-1 py-2 bg-purple-900/20 hover:bg-purple-600 text-purple-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-all duration-200"
							>
								Calculate
							</button>
							<button 
								on:click|stopPropagation={() => deleteTournament(t.id)}
								class="px-3 py-2 bg-red-900/10 hover:bg-red-900/30 text-red-500/50 hover:text-red-400 rounded transition-all"
							>
								<i class="bi bi-trash"></i>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if showModal && selectedTournament}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			on:click={closeModal}
			transition:fade={{ duration: 200 }}
		>
			<div 
				class="bg-[#121214] border border-white/10 w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden"
				on:click|stopPropagation
				in:fly={{ y: 20, duration: 300 }}
			>
				<div class="h-1 w-full bg-gradient-to-r from-cyan-600 to-purple-600"></div>

				<div class="p-8">
					<div class="flex justify-between items-start mb-6">
						<div>
							<h2 class="text-3xl font-bold text-white font-['Rajdhani'] uppercase">{selectedTournament.name}</h2>
							<p class="text-[10px] text-gray-500 font-bold uppercase mt-1">Total Teams: {selectedTournament.teams.length}</p>
						</div>
						<button on:click={closeModal} class="text-gray-500 hover:text-white transition">
							<i class="bi bi-x-lg"></i>
						</button>
					</div>

					<div class="bg-black/30 rounded border border-white/5 p-4 mb-6">
						<div class="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
							<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Roster</h3>
						</div>
						
						<div class="max-h-60 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
							{#if selectedTournament.roundRobin}
								{#each Array(selectedTournament.groupCount) as _, i}
									{@const groupLabel = String.fromCharCode(65 + i)}
									{@const groupTeams = selectedTournament.teams.filter(t => t.group === groupLabel)}
									
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
								{#if selectedTournament.teams.length > 0}
									{#each selectedTournament.teams as team, i}
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

					<div class="grid grid-cols-2 gap-3">
						<button 
							on:click={() => selectedTournament && navigateToPoints(selectedTournament.id)}
							class="py-3 bg-white text-black hover:bg-cyan-400 font-bold uppercase tracking-widest rounded shadow-lg transition-all text-xs"
						>
							Manage Points
						</button>
						<button 
							on:click={closeModal}
							class="py-3 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest rounded transition-all text-xs"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom Scrollbar for the modal list */
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>