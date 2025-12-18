<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation'; 
	import { tournamentStore, type Tournament, type MatchResult } from '$lib/stores/tournamentStore';
	import { onDestroy } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';


	// --- STATE ---
	let tournament: Tournament | null = null;
	
	// UI Logic
	let currentMatchId = 1;
	let selectedTeamId = '';
	let searchQuery = '';
	let inputKills: number | null = null;
	let inputPosition: number | null = null;
	let uploadedImages: string[] = [];

	// Image Viewer State
	let viewingImage: string | null = null;
	let zoomLevel = 1;

	let session: Session | null = null;
	let loading = true;

	onMount(async () => {
		// 1. Check Session
		const {data, error} = await supabase.auth.getSession();

		if(error || !data.session) {
			goto('/login');
			return;
		}

		session = data.session;
		loading = false;
	})

	// Display Interface
	interface DisplayEntry extends MatchResult {
		teamName: string;
		teamGroup: string | null;
	}
	let currentEntries: DisplayEntry[] = [];

	// --- STORE SUBSCRIPTION ---
	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === $page.params.id) ?? null;
		
		if (found) {
			const isNew = !tournament || tournament.id !== found.id;
			tournament = found;
			
			if (isNew) {
				loadMatchData(currentMatchId);
			}
		}
	});
	onDestroy(unsubscribe);

	// --- HELPERS ---

	function loadMatchData(matchId: number) {
		currentEntries = [];
		if (!tournament) return;

		const matches = tournament.matches || [];
		const match = matches.find(m => m.id === matchId);
		
		if (match) {
			currentEntries = match.results.map(r => {
				const team = tournament?.teams.find(t => t.id === r.teamId);
				return {
					...r,
					teamName: team?.name ?? 'Unknown Team',
					teamGroup: team?.group ?? null
				};
			});
		}
	}

	$: if (tournament && currentMatchId) {
		loadMatchData(currentMatchId);
	}

	$: filteredTeams = tournament?.teams.filter((t) => {
		const matchName = t.name.toLowerCase().includes(searchQuery.toLowerCase());
		const alreadyEntered = currentEntries.some(e => e.teamId === t.id);
		return matchName && !alreadyEntered;
	}) ?? [];

	function calculatePoints(kills: number, pos: number) {
		if (!tournament) return { k: 0, p: 0, t: 0 };
		const kPoints = kills * tournament.scoring.killPoints;
		const pObj = tournament.scoring.positions.find(x => x.place === pos);
		const pPoints = pObj ? pObj.points : 0;
		return { k: kPoints, p: pPoints, t: kPoints + pPoints };
	}

	function handleAddOrUpdate() {
		if (!tournament || !selectedTeamId || inputPosition === null || inputKills === null) {
			alert("Please select a team and enter Kills/Position");
			return;
		}

		const team = tournament.teams.find(t => t.id === selectedTeamId);
		if (!team) return;

		const { k, p, t } = calculatePoints(inputKills, inputPosition);

		const newEntry: DisplayEntry = {
			teamId: team.id,
			teamName: team.name,
			teamGroup: team.group,
			kills: inputKills,
			position: inputPosition,
			killPoints: k,
			placePoints: p,
			totalPoints: t
		};

		currentEntries = [newEntry, ...currentEntries];

		selectedTeamId = '';
		searchQuery = '';
		inputKills = null;
		inputPosition = null;
	}

	function removeEntry(teamId: string) {
		currentEntries = currentEntries.filter(e => e.teamId !== teamId);
	}

	function editEntry(entry: DisplayEntry) {
		selectedTeamId = entry.teamId;
		searchQuery = entry.teamName;
		inputKills = entry.kills;
		inputPosition = entry.position;
		removeEntry(entry.teamId);
	}

	function saveMatch() {
		if (!tournament) return;
		
		const resultsToSave: MatchResult[] = currentEntries.map(e => ({
			teamId: e.teamId,
			kills: e.kills,
			position: e.position,
			killPoints: e.killPoints,
			placePoints: e.placePoints,
			totalPoints: e.totalPoints
		}));

		tournamentStore.saveMatch(tournament.id, currentMatchId, resultsToSave);
		alert(`Match ${currentMatchId} saved successfully!`);
	}

	function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			const newImages = Array.from(input.files).map((file) => URL.createObjectURL(file));
			uploadedImages = [...uploadedImages, ...newImages];
		}
	}

	function openImage(src: string) {
		viewingImage = src;
		zoomLevel = 1;
	}

	function closeImage() {
		viewingImage = null;
		zoomLevel = 1;
	}

	function zoomIn() {
		if (zoomLevel < 3) zoomLevel += 0.5;
	}

	function zoomOut() {
		if (zoomLevel > 1) zoomLevel -= 0.5;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeImage();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-6 pb-24 font-['Inter'] relative selection:bg-cyan-500 selection:text-black">
	{#if tournament}
		<div class="max-w-4xl mx-auto space-y-6">

			<div 
				class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0E0E10] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden"
				in:fly={{ y: -20, duration: 400 }}
			>
				<div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500"></div>

				<h1 class="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-wide">
					Data <span class="text-cyan-500">Entry</span>
				</h1>
				
				<div class="flex items-center gap-4 bg-black/40 p-2 pr-4 rounded-lg border border-white/5">
					<div class="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">Match ID</div>
					<div class="flex items-center gap-3">
						<button class="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 flex items-center justify-center transition-all active:scale-95" 
							on:click={() => currentMatchId = Math.max(1, currentMatchId - 1)}
						>
							<i class="bi bi-dash-lg"></i>
						</button>
						<span class="text-2xl font-bold font-['Rajdhani'] text-white min-w-[30px] text-center">{currentMatchId}</span>
						<button class="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 flex items-center justify-center transition-all active:scale-95" 
							on:click={() => currentMatchId++}
						>
							<i class="bi bi-plus-lg"></i>
						</button>
					</div>
				</div>
				
				<button 
					on:click={saveMatch}
					class="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-['Rajdhani'] tracking-widest uppercase rounded shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105 active:scale-95"
				>
					Save Data
				</button>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				
				<div 
					class="lg:col-span-1 bg-[#0E0E10] p-5 rounded-xl border border-white/5 shadow-lg flex flex-col gap-4"
					in:fade={{ duration: 400, delay: 100 }}
				>
					<label class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
						<i class="bi bi-images text-cyan-500"></i> Evidence / Screenshots
					</label>
					
					<label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-cyan-500/50 hover:bg-white/[0.02] transition-all group">
						<div class="flex flex-col items-center justify-center pt-5 pb-6">
							<i class="bi bi-cloud-upload text-2xl text-gray-600 group-hover:text-cyan-400 mb-2 transition-colors"></i>
							<p class="text-xs text-gray-500 group-hover:text-gray-300">Click to upload</p>
						</div>
						<input type="file" multiple accept="image/*" on:change={handleImageUpload} class="hidden" />
					</label>

					{#if uploadedImages.length > 0}
						<div class="grid grid-cols-3 gap-2 overflow-y-auto max-h-40 custom-scrollbar pr-1">
							{#each uploadedImages as img}
								<button 
									class="aspect-video relative rounded overflow-hidden border border-white/10 group focus:outline-none focus:ring-2 focus:ring-cyan-500"
									on:click={() => openImage(img)}
								>
									<img src={img} alt="ref" class="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
									<div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
										<i class="bi bi-zoom-in text-white"></i>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div 
					class="lg:col-span-2 bg-[#0E0E10] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden"
					in:fade={{ duration: 400, delay: 200 }}
				>
					<div class="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

					<div class="flex justify-between items-end mb-6 relative z-10">
						<div>
							<h3 class="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider">Input Result</h3>
							<p class="text-[10px] text-gray-500 font-mono mt-1">TARGET: MATCH {currentMatchId}</p>
						</div>
					</div>
					
					<div class="mb-5 relative z-20">
						<label class="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-2 block">Select Unit</label>
						<div class="relative">
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="SEARCH TEAM NAME..."
								class="w-full p-4 pl-12 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm uppercase"
								on:input={() => selectedTeamId = ''} 
							/>
							<i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
							
							{#if searchQuery && !selectedTeamId}
								<div class="absolute w-full mt-2 bg-[#151518] border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 custom-scrollbar">
									{#if filteredTeams.length > 0}
										{#each filteredTeams as t}
											<button
												class="w-full text-left px-4 py-3 hover:bg-cyan-900/20 border-b border-white/5 last:border-0 flex justify-between items-center group transition-colors"
												on:click={() => { selectedTeamId = t.id; searchQuery = t.name; }}
											>
												<span class="font-bold text-gray-300 group-hover:text-white font-mono">{t.name}</span>
												{#if t.group}<span class="text-[10px] bg-black/40 text-cyan-600 px-2 py-0.5 rounded border border-white/5">GRP {t.group}</span>{/if}
											</button>
										{/each}
									{:else}
										<div class="p-3 text-xs text-gray-500 text-center font-mono">NO UNITS FOUND</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div>
							<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Kill Count</label>
							<input type="number" bind:value={inputKills} class="w-full p-4 text-center rounded-lg bg-black/40 border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-800" placeholder="0" />
						</div>
						<div>
							<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Rank #</label>
							<input type="number" bind:value={inputPosition} class="w-full p-4 text-center rounded-lg bg-black/40 border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-800" placeholder="#" />
						</div>
					</div>

					<button 
						on:click={handleAddOrUpdate} 
						class="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-cyan-900 hover:to-cyan-800 text-white font-bold font-['Rajdhani'] text-lg tracking-[0.15em] rounded-lg shadow-lg border border-white/5 hover:border-cyan-500/50 transition-all active:scale-[0.98] group"
					>
						CONFIRM ENTRY <i class="bi bi-arrow-right ml-2 group-hover:translate-x-1 transition-transform inline-block"></i>
					</button>
				</div>
			</div>

			<div 
				class="bg-[#0E0E10] rounded-xl border border-white/5 shadow-2xl overflow-hidden"
				in:slide={{ duration: 400, delay: 300 }}
			>
				<div class="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<h3 class="font-bold text-white font-['Rajdhani'] uppercase tracking-wider">Live Feed <span class="text-gray-600 ml-2">// MATCH {currentMatchId}</span></h3>
					</div>
					
					<div class="flex items-center gap-3">
						<span class="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden sm:inline-block">Entries: <span class="text-white">{currentEntries.length}</span></span>
						<button 
							on:click={() => goto(`/tournament/${tournament?.id}/table`)}
							class="text-[10px] font-bold text-black bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
						>
							Leaderboard
						</button>
					</div>
				</div>

				<div class="divide-y divide-white/5">
					{#if currentEntries.length === 0}
						<div class="p-12 text-center">
							<i class="bi bi-database-x text-4xl text-gray-800 mb-3 block"></i>
							<p class="text-gray-600 font-mono text-sm uppercase tracking-widest">No data captured</p>
						</div>
					{:else}
						{#each currentEntries as entry (entry.teamId)}
							<div class="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group" transition:slide|local>
								
								<div class="flex items-center gap-4">
									<div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center font-['Rajdhani'] font-bold text-gray-500 border border-white/5">
										#{entry.position}
									</div>
									<div>
										<div class="font-bold text-gray-200 text-lg leading-none font-['Rajdhani'] flex items-center gap-2">
											{entry.teamName}
											{#if entry.teamGroup}
												<span class="text-[9px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded border border-white/5 font-mono">GRP {entry.teamGroup}</span>
											{/if}
										</div>
										<div class="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-bold">
											<span class="text-red-400">{entry.kills} KILLS</span>
										</div>
									</div>
								</div>
								
								<div class="flex items-center gap-6">
									<div class="text-right">
										<div class="text-2xl font-black text-cyan-500 font-['Rajdhani'] leading-none">{entry.totalPoints}</div>
										<div class="text-[9px] font-bold text-gray-600 uppercase tracking-widest">PTS</div>
									</div>
									
									<div class="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-l border-white/10 pl-3">
										<button on:click={() => editEntry(entry)} class="text-[10px] text-cyan-600 hover:text-cyan-400 font-bold uppercase tracking-wider text-left">EDIT</button>
										<button on:click={() => removeEntry(entry.teamId)} class="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase tracking-wider text-left">DEL</button>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-[80vh] gap-4">
			<div class="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
			<p class="text-cyan-500 font-mono text-sm animate-pulse tracking-widest">LOADING DATA STREAM...</p>
		</div>
	{/if}
</div>

{#if viewingImage}
	<div 
		class="fixed inset-0 z-50 bg-black/95 flex flex-col"
		transition:fade={{ duration: 150 }}
	>
		<div class="flex justify-between items-center p-4 bg-black/80 backdrop-blur-sm z-20 shadow-xl border-b border-white/10">
			<h2 class="font-bold text-lg font-['Rajdhani'] text-white uppercase tracking-widest flex items-center gap-2">
				<i class="bi bi-eye text-cyan-500"></i> Visual Intel
			</h2>
			<div class="flex items-center gap-3">
				<div class="flex items-center bg-white/5 rounded-lg border border-white/10">
					<button on:click={zoomOut} class="w-10 h-9 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition" title="Zoom Out"><i class="bi bi-dash"></i></button>
					<span class="w-12 text-center font-mono text-xs text-cyan-500 border-x border-white/10">{Math.round(zoomLevel * 100)}%</span>
					<button on:click={zoomIn} class="w-10 h-9 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition" title="Zoom In"><i class="bi bi-plus"></i></button>
				</div>
				<button on:click={closeImage} class="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
					Close
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-auto bg-[#050505] relative w-full h-full flex p-4 cursor-grab active:cursor-grabbing">
			<div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
			
			<img 
				src={viewingImage} 
				alt="Zoomed Reference" 
				class="shadow-2xl rounded transition-all duration-200 ease-out m-auto block relative z-10"
				style="width: {zoomLevel * 100}%; max-width: none; flex-shrink: 0;" 
				on:click={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }

	.bg-grid-pattern {
		background-size: 40px 40px;
		background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
						  linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
	}
</style>	