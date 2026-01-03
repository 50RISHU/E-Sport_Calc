<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tournamentStore, type Tournament, type MatchResult } from '$lib/stores/tournamentStore';
	import { onDestroy, onMount } from 'svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import MatchEntryForm from '$lib/components/MatchEntryForm.svelte';

	let tournamentId = $page.params.id ?? '';
	let tournament: Tournament | null = $state(null);
	let currentMatchId = $state(1);
	let currentEntries: any[] = $state([]);
	let uploadedImages: string[] = $state([]);

	// --- LOAD DATA ---
	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) {
			goto('/login');
			return;
		}
		if ($tournamentStore.length === 0) {
			await tournamentStore.loadTournaments();
		}
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === tournamentId);
		if (found) {
			if (!tournament || tournament.id !== found.id) {
				tournament = found;
				// Auto-detect next match
				if (tournament.matches && tournament.matches.length > 0) {
					currentMatchId = Math.max(...tournament.matches.map(m => m.matchId)) + 1;
				} else {
					currentMatchId = 1;
				}
				loadMatchData(currentMatchId);
			} else {
				tournament = found;
			}
		}
	});
	onDestroy(unsubscribe);

	// Load entries when match ID changes
	$effect(() => {
		loadMatchData(currentMatchId);
	});

	function loadMatchData(matchId: number) {
		if (!tournament) return;
		const match = tournament.matches.find(m => m.matchId === matchId);
		
		if (match) {
			currentEntries = match.results.map(r => {
				const team = tournament?.teams.find(t => t.id === r.teamId);
				return { ...r, teamName: team?.name ?? 'Unknown', teamGroup: team?.group ?? null };
			}).sort((a, b) => a.place - b.place);
		} else {
			currentEntries = [];
		}
	}

	function calculatePoints(kills: number, place: number) {
		if (!tournament) return { k: 0, p: 0, t: 0 };
		const k = kills * tournament.scoring.killPoints;
		const pos = tournament.scoring.positions.find(x => x.place === place);
		const p = pos ? pos.points : 0;
		return { k, p, t: k + p };
	}

	function addEntry(teamId: string, kills: number, place: number) {
		if (!tournament) return;
		const team = tournament.teams.find(t => t.id === teamId);
		if (!team) return;

		const { k, p, t } = calculatePoints(kills, place);

		const newEntry = {
			teamId: team.id,
			teamName: team.name,
			teamGroup: team.group ?? null,
			kills,
			place,
			killPoints: k,
			placePoints: p,
			totalPoints: t
		};

		currentEntries = [newEntry, ...currentEntries];
	}

	function removeEntry(teamId: string) {
		currentEntries = currentEntries.filter(e => e.teamId !== teamId);
	}

	async function saveMatch() {
		if (!tournament) return;
		const resultsToSave = currentEntries.map(e => ({
			teamId: e.teamId,
			kills: e.kills,
			place: e.place,
			killPoints: e.killPoints,
			placePoints: e.placePoints,
			totalPoints: e.totalPoints
		}));

		const success = await tournamentStore.saveMatch(tournament.id, currentMatchId, resultsToSave);
		if(success) {
			alert(`Match ${currentMatchId} saved!`);
			currentMatchId++;
		}
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl -z-40 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-6 pb-24 font-['Inter'] relative">

	{#if tournament}
		<div class="max-w-6xl mx-auto space-y-6 pt-8 md:pt-0">

			<div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0E0E10] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden" in:fly={{ y: -20, duration: 400 }}>
				<div class="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-cyan-500 to-purple-500"></div>
				<h1 class="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-wide">
					Data <span class="text-cyan-500">Entry</span>
				</h1>
				
				<div class="flex items-center gap-4 bg-black/40 p-2 pr-4 rounded-lg border border-white/5">
					<div class="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/5">Match ID</div>
					<div class="flex items-center gap-3">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button class="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 flex items-center justify-center transition-all active:scale-95" onclick={() => currentMatchId = Math.max(1, currentMatchId - 1)}><i class="bi bi-dash-lg"></i></button>
						<span class="text-2xl font-bold font-['Rajdhani'] text-white min-w-[30px] text-center">{currentMatchId}</span>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button class="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 flex items-center justify-center transition-all active:scale-95" onclick={() => currentMatchId++}><i class="bi bi-plus-lg"></i></button>
					</div>
				</div>
				
				<button onclick={saveMatch} class="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-['Rajdhani'] tracking-widest uppercase rounded shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all hover:scale-105 active:scale-95">
					Save & Next
				</button>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				
				<div class="lg:col-span-1 h-full" in:fade={{ duration: 400, delay: 100 }}>
					<ImageUploader 
						bind:images={uploadedImages} 
						onUpload={(files) => {
							const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
							uploadedImages = [...uploadedImages, ...newUrls];
						}}
					/>
				</div>

				<div class="lg:col-span-2 h-full" in:fade={{ duration: 400, delay: 200 }}>
					<MatchEntryForm 
						currentMatchId={currentMatchId}
						teams={tournament.teams}
						entries={currentEntries}
						onAddEntry={addEntry}
					/>
				</div>
			</div>

			<div class="bg-[#0E0E10] rounded-xl border border-white/5 shadow-2xl overflow-hidden" in:slide={{ duration: 400, delay: 300 }}>
				<div class="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
					<div class="flex items-center gap-3">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<h3 class="font-bold text-white font-['Rajdhani'] uppercase tracking-wider">Live Feed <span class="text-gray-600 ml-2">// MATCH {currentMatchId}</span></h3>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden sm:inline-block">Entries: <span class="text-white">{currentEntries.length}</span></span>
						<button onclick={() => goto(`/tournament/${tournamentId}/table`)} class="text-[10px] font-bold text-black bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded uppercase tracking-wider transition-colors shadow-lg shadow-cyan-900/20">
							<i class="bi bi-table mr-1"></i> Leaderboard
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
							<div class="p-4 flex items-center justify-between hover:bg-white/2 transition-colors group">
								<div class="flex items-center gap-4">
									<div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center font-['Rajdhani'] font-bold text-gray-500 border border-white/5">#{entry.place}</div>
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
									<button onclick={() => removeEntry(entry.teamId)} class="text-[10px] text-red-900 hover:text-red-500 font-bold uppercase tracking-wider text-left border-l border-white/10 pl-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">DEL</button>
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