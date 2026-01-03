<script lang="ts">
	// FIX 1: Import the Team type
	import type { Team } from '$lib/stores/tournamentStore';

	// FIX 2: Define a minimal type for the entries we are checking
	interface Entry {
		teamId: string;
		[key: string]: any; // Allow other properties like kills/points
	}

	let { 
		currentMatchId, 
		teams, 
		entries,
		onAddEntry 
	} = $props<{
		currentMatchId: number;
		teams: Team[];     // FIX 3: Use Team[] instead of any[]
		entries: Entry[];  // FIX 4: Use Entry[] instead of any[]
		onAddEntry: (teamId: string, kills: number, place: number) => void;
	}>();

	let searchQuery = $state('');
	let selectedTeamId = $state('');
	let inputKills: number | null = $state(null);
	let inputPlace: number | null = $state(1);

	// FIX 5: Now 't' and 'e' are strictly typed, removing the errors
	const filteredTeams = $derived(teams.filter((t: Team) => {
		if (!searchQuery) return false;
		const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
		const notAdded = !entries.some((e: Entry) => e.teamId === t.id);
		return nameMatch && notAdded;
	}));

	function selectTeam(t: Team) {
		selectedTeamId = t.id;
		searchQuery = t.name;
	}

	function handleSubmit() {
		if (selectedTeamId && inputKills !== null && inputPlace !== null) {
			onAddEntry(selectedTeamId, inputKills, inputPlace);
			
			selectedTeamId = '';
			searchQuery = '';
			inputKills = null;
			inputPlace = (inputPlace || 0) + 1; 
		}
	}
</script>

<div class="bg-[#0E0E10] p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden h-full">
	<div class="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/5 rounded-full pointer-events-none"></div>

	<div class="flex justify-between items-end mb-6 relative z-10">
		<div>
			<h3 class="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider">Input Result</h3>
			<p class="text-[10px] text-gray-500 font-mono mt-1">TARGET: MATCH {currentMatchId}</p>
		</div>
	</div>
	
	<div class="mb-5 relative z-20">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-2 block">Select Unit</label>
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="SEARCH TEAM NAME..."
				class="w-full p-4 pl-12 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm uppercase"
				oninput={() => selectedTeamId = ''} 
			/>
			<i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
			
			{#if searchQuery && !selectedTeamId}
				<div class="absolute w-full mt-2 bg-[#151518] border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 custom-scrollbar">
					{#if filteredTeams.length > 0}
						{#each filteredTeams as t}
							<button
								class="w-full text-left px-4 py-3 hover:bg-cyan-900/20 border-b border-white/5 last:border-0 flex justify-between items-center group transition-colors"
								onclick={() => selectTeam(t)}
							>
								<span class="font-bold text-gray-300 group-hover:text-white font-mono">{t.name}</span>
								{#if t.group}<span class="text-[9px] bg-black/40 text-cyan-600 px-2 py-0.5 rounded border border-white/5">GRP {t.group}</span>{/if}
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
			<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block" for="kill-count">Kill Count</label>
			<input type="number" id="kill-count" bind:value={inputKills} class="w-full p-4 text-center rounded-lg bg-black/40 border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder-gray-800" placeholder="0" />
		</div>
		<div>
			<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block" for="rank">Rank #</label>
			<input type="number" id="rank" bind:value={inputPlace} class="w-full p-4 text-center rounded-lg bg-black/40 border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-800"  placeholder="#" />
		</div>
	</div>

	<button 
		onclick={handleSubmit} 
		class="w-full py-4 bg-linear-to-r from-gray-800 to-gray-700 hover:from-cyan-900 hover:to-cyan-800 text-white font-bold font-['Rajdhani'] text-lg tracking-[0.15em] rounded-lg shadow-lg border border-white/5 hover:border-cyan-500/50 transition-all active:scale-[0.98] group"
	>
		CONFIRM ENTRY <i class="bi bi-arrow-right ml-2 group-hover:translate-x-1 transition-transform inline-block"></i>
	</button>
</div>