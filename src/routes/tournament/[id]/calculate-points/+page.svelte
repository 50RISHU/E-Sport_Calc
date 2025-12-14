<script lang="ts">
	import { page } from '$app/stores';
	import { tournamentStore, type Tournament, type MatchResult } from '$lib/stores/tournamentStore';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

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
	let zoomLevel = 1; // 1 = 100% width, 2 = 200% width, etc.

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

	// Load data for specific match ID
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

	// Reactively load when match ID changes
	$: if (tournament && currentMatchId) {
		loadMatchData(currentMatchId);
	}

	// Filter teams for dropdown
	$: filteredTeams = tournament?.teams.filter((t) => {
		const matchName = t.name.toLowerCase().includes(searchQuery.toLowerCase());
		const alreadyEntered = currentEntries.some(e => e.teamId === t.id);
		return matchName && !alreadyEntered;
	}) ?? [];

	// Calculation Logic
	function calculatePoints(kills: number, pos: number) {
		if (!tournament) return { k: 0, p: 0, t: 0 };
		const kPoints = kills * tournament.scoring.killPoints;
		const pObj = tournament.scoring.positions.find(x => x.place === pos);
		const pPoints = pObj ? pObj.points : 0;
		return { k: kPoints, p: pPoints, t: kPoints + pPoints };
	}

	// Add / Update Local List
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

		// Reset inputs
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

	// --- IMAGE VIEWER LOGIC ---
	function openImage(src: string) {
		viewingImage = src;
		zoomLevel = 1;
	}

	function closeImage() {
		viewingImage = null;
		zoomLevel = 1;
	}

	function zoomIn() {
		if (zoomLevel < 3) zoomLevel += 0.5; // Cap at 3x
	}

	function zoomOut() {
		if (zoomLevel > 1) zoomLevel -= 0.5; // Cap at 1x
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeImage();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen bg-[#DCD7C9] p-4 pb-24">
	{#if tournament}
		<div class="max-w-3xl mx-auto space-y-6">

			<div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#A27B5C]/30">
				<h1 class="text-2xl font-bold text-[#3D2C2E]">Calculate Points</h1>
				
				<div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border">
					<label class="font-bold text-sm text-[#3D2C2E]">Match No.</label>
					<div class="flex items-center gap-1">
						<button class="w-8 h-8 rounded bg-white border hover:bg-gray-100 font-bold shadow-sm" 
							on:click={() => currentMatchId = Math.max(1, currentMatchId - 1)}>-</button>
						<input 
							type="number" 
							bind:value={currentMatchId} 
							class="w-12 h-8 text-center border rounded font-bold bg-white"
							min="1"
						/>
						<button class="w-8 h-8 rounded bg-white border hover:bg-gray-100 font-bold shadow-sm" 
							on:click={() => currentMatchId++}>+</button>
					</div>
				</div>
				
				<button 
					on:click={saveMatch}
					class="px-6 py-2 bg-[#A27B5C] text-white font-bold rounded-lg shadow-md hover:bg-[#8f6a50] transition transform active:scale-95"
				>
					SAVE MATCH
				</button>
			</div>

			<div class="bg-white p-4 rounded-xl shadow-sm border border-[#A27B5C]/30">
				<label class="block text-sm font-bold text-[#3D2C2E] mb-2">
					<i class="bi bi-image"></i> Upload Reference (Screenshot)
				</label>
				<input
					type="file" multiple accept="image/*"
					on:change={handleImageUpload}
					class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F6E6C9] file:text-[#A27B5C] hover:file:bg-[#eadbc0]"
				/>
				{#if uploadedImages.length > 0}
					<p class="text-xs text-gray-400 mt-2 italic">Click an image to view full screen</p>
					<div class="flex gap-2 overflow-x-auto mt-2 pb-2">
						{#each uploadedImages as img}
							<button 
								class="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#A27B5C] rounded-lg"
								on:click={() => openImage(img)}
							>
								<img src={img} alt="ref" class="h-24 w-auto rounded-lg border shadow-sm object-cover hover:opacity-80 transition" />
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="bg-white p-6 rounded-xl shadow-lg border border-[#A27B5C]/30 relative z-10">
				<div class="flex justify-between items-end mb-4">
					<h3 class="text-lg font-bold text-[#3D2C2E]">Add Result</h3>
					<span class="text-xs text-gray-400 font-medium">Match {currentMatchId}</span>
				</div>
				
				<div class="mb-4 relative">
					<label class="text-sm font-semibold text-gray-600 block mb-1">Select Team</label>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search team name..."
						class="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#A27B5C] outline-none"
						on:input={() => selectedTeamId = ''} 
					/>
					{#if searchQuery && !selectedTeamId}
						<div class="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
							{#if filteredTeams.length > 0}
								{#each filteredTeams as t}
									<button
										class="w-full text-left px-4 py-3 hover:bg-[#F6E6C9] border-b last:border-0 flex justify-between items-center transition-colors"
										on:click={() => { selectedTeamId = t.id; searchQuery = t.name; }}
									>
										<span class="font-medium text-[#3D2C2E]">{t.name}</span>
										{#if t.group}<span class="text-[10px] bg-[#A27B5C] text-white px-2 py-0.5 rounded-full">Group {t.group}</span>{/if}
									</button>
								{/each}
							{:else}
								<div class="p-3 text-sm text-gray-500 text-center">No teams found or already added.</div>
							{/if}
						</div>
					{/if}
				</div>

				<div class="flex gap-4 mb-4">
					<div class="flex-1">
						<label class="text-sm font-semibold text-gray-600 block mb-1">Kills</label>
						<input type="number" bind:value={inputKills} class="w-full p-3 border rounded-lg text-center font-bold text-xl bg-gray-50 focus:ring-2 focus:ring-[#A27B5C] outline-none" placeholder="0" />
					</div>
					<div class="flex-1">
						<label class="text-sm font-semibold text-gray-600 block mb-1">Position (#)</label>
						<input type="number" bind:value={inputPosition} class="w-full p-3 border rounded-lg text-center font-bold text-xl bg-gray-50 focus:ring-2 focus:ring-[#A27B5C] outline-none" placeholder="#" />
					</div>
				</div>

				<button 
					on:click={handleAddOrUpdate} 
					class="w-full py-3 bg-[#3D2C2E] text-white font-bold rounded-lg shadow-md hover:bg-[#523b3e] transition active:scale-95 flex justify-center gap-2"
				>
					ADD ENTRY <span class="text-[#A27B5C]">➔</span>
				</button>
			</div>

			<div class="bg-white rounded-xl shadow border border-[#A27B5C]/20 overflow-hidden">
				<div class="p-4 bg-[#F6E6C9]/50 border-b border-[#A27B5C]/20 flex justify-between items-center">
					<h3 class="font-bold text-[#3D2C2E]">Entered Data <span class="text-sm font-normal opacity-70">(Match {currentMatchId})</span></h3>
					<span class="text-sm font-bold bg-white px-2 py-1 rounded border text-[#A27B5C]">{currentEntries.length} Teams</span>
				</div>

				{#if currentEntries.length === 0}
					<div class="p-10 text-center text-gray-400 italic bg-gray-50">
						No data entered for Match {currentMatchId} yet.
					</div>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each currentEntries as entry (entry.teamId)}
							<div class="p-4 flex items-center justify-between hover:bg-[#FAF9F6] transition" transition:fade|local>
								<div>
									<div class="font-bold text-[#3D2C2E] text-lg flex items-center gap-2">
										{entry.teamName}
										{#if entry.teamGroup}
											<span class="text-[10px] bg-[#A27B5C] text-white px-1.5 py-0.5 rounded">Grp {entry.teamGroup}</span>
										{/if}
									</div>
									<div class="text-xs text-gray-500 flex gap-2 mt-1">
										<span class="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-100">#{entry.position} Place</span>
										<span class="bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-100">{entry.kills} Kills</span>
									</div>
								</div>
								
								<div class="flex items-center gap-5">
									<div class="text-right">
										<div class="text-xl font-black text-[#A27B5C]">{entry.totalPoints}</div>
										<div class="text-[10px] font-bold text-gray-300 tracking-wider">PTS</div>
									</div>
									<div class="flex flex-col gap-1 pl-3 border-l">
										<button on:click={() => editEntry(entry)} class="text-blue-600 text-xs hover:underline font-semibold">EDIT</button>
										<button on:click={() => removeEntry(entry.teamId)} class="text-red-500 text-xs hover:underline font-semibold">REMOVE</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

		</div>
	{:else}
		<div class="flex items-center justify-center h-[80vh] text-gray-500 font-medium animate-pulse">
			Loading tournament data...
		</div>
	{/if}
</div>

{#if viewingImage}
	<div 
		class="fixed inset-0 z-50 bg-black/95 flex flex-col"
		transition:fade={{ duration: 150 }}
	>
		<div class="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm z-20 shadow-sm text-white border-b border-white/10">
			<h2 class="font-bold text-lg">Reference View</h2>
			<div class="flex items-center gap-3">
				<div class="flex items-center bg-white/10 rounded-lg">
					<button on:click={zoomOut} class="w-10 h-9 flex items-center justify-center hover:bg-white/20 rounded-l-lg font-bold text-xl active:bg-white/30" title="Zoom Out">−</button>
					<span class="w-12 text-center font-mono text-sm border-x border-white/10">{Math.round(zoomLevel * 100)}%</span>
					<button on:click={zoomIn} class="w-10 h-9 flex items-center justify-center hover:bg-white/20 rounded-r-lg font-bold text-xl active:bg-white/30" title="Zoom In">+</button>
				</div>
				<button on:click={closeImage} class="bg-[#A27B5C] hover:bg-[#8f6a50] text-white px-4 py-2 rounded-lg font-bold text-sm">
					Close
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-auto bg-black relative w-full h-full flex p-4">
			<img 
				src={viewingImage} 
				alt="Zoomed Reference" 
				class="shadow-2xl rounded-sm transition-all duration-200 ease-out m-auto block"
				style="width: {zoomLevel * 100}%; max-width: none; flex-shrink: 0;" 
				on:click={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}