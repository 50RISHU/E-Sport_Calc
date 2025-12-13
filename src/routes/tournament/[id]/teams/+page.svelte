<script lang="ts">
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";
	import { tournamentStore, type Tournament } from "$lib/stores/tournamentStore";
	import TeamCard from "$lib/components/TeamCard.svelte";
	import { derived } from "svelte/store";
	import { fade, fly } from "svelte/transition"; // Added transition imports

	let id = "";
	let tournament: Tournament | null = null;

	let tab: "add" | "entered" = "add";
	let teamName = "";
	let teamTag = "";
	let teamPlayers: string[] = [""];
	let teamLogoFile: File | null = null;
	let selectedGroup = "A";

	// 1️⃣ Get ID reactively
	$: id = $page.params.id;

	// 2️⃣ Derived tournament updates automatically
	const activeTournament = derived(
		[tournamentStore, page],
		([$list, $page]) => $list.find((t) => t.id === $page.params.id) ?? null
	);

	const unsubscribe = activeTournament.subscribe((v) => {
		tournament = v;
		// Reset selected group to A if tournament loads and group is invalid
		if (tournament?.roundRobin && !selectedGroup) {
			selectedGroup = "A";
		}
	});
	onDestroy(unsubscribe);

	// 3️⃣ Helper to Generate Group Labels (A, B, C...) based on count
	$: groupLabels = tournament?.roundRobin
		? Array.from({ length: tournament.groupCount }, (_, i) => String.fromCharCode(65 + i))
		: [];

	// logo upload
	function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		teamLogoFile = input.files[0];
	}

	function addPlayerField() {
		if (teamPlayers.length < 8) teamPlayers = [...teamPlayers, ""];
	}

	function removePlayerField(i: number) {
		if (teamPlayers.length > 1) {
			teamPlayers = teamPlayers.filter((_, idx) => idx !== i);
		}
	}

	function validateTeam(): string | null {
		if (!teamName.trim()) return "Team name is required.";
		const filled = teamPlayers.filter((p) => p.trim());
		if (filled.length < 1) return "At least one player required.";
		return null;
	}

	function addTeam() {
		if (!tournament) return;

		const err = validateTeam();
		if (err) return alert(err);

		const teamPayload = {
			name: teamName.trim(),
			tag: teamTag.trim(),
			logo: teamLogoFile ? URL.createObjectURL(teamLogoFile) : null,
			// Store group only if Round Robin is enabled
			group: tournament.roundRobin ? selectedGroup : null, 
			players: teamPlayers.filter((p) => p.trim())
		};

		const res = tournamentStore.addTeam(tournament.id, teamPayload);

		if (!res.ok) return alert(res.error ?? "Failed to add team");

		// Reset form
		teamName = "";
		teamTag = "";
		teamPlayers = [""];
		teamLogoFile = null;
		// Keep the selected group same for faster data entry, or reset to A
	}
	
	function deleteTeam(teamId: string) {
		if (!tournament) return;
		if (confirm("Delete this team?")) {
			tournamentStore.removeTeam(tournament.id, teamId);
		}
	}
</script>

<div class="bg-[#DCD7C9] min-h-screen p-3 space-y-6">
	<h2 class="text-xl font-bold text-[#3D2C2E] text-center">
		{tournament?.name || "Tournament"} Teams
	</h2>

	<div class="max-w-xl mx-auto bg-white rounded-2xl shadow p-3 border border-[#A27B5C]/30 space-y-4">
		
		<div class="flex gap-2">
			<button
				class="flex-1 py-2 rounded-lg font-medium transition-colors {tab === 'add'
					? 'bg-[#A27B5C] text-white'
					: 'text-[#3D2C2E] hover:bg-gray-100'}"
				on:click={() => (tab = 'add')}>Add Team</button
			>
			<button
				class="flex-1 py-2 rounded-lg font-medium transition-colors {tab === 'entered'
					? 'bg-[#A27B5C] text-white'
					: 'text-[#3D2C2E] hover:bg-gray-100'}"
				on:click={() => (tab = 'entered')}>Entered ({tournament?.teams.length ?? 0})</button
			>
		</div>

		{#if tab === 'add'}
			<div in:fly={{ y: 8, duration: 220 }} class="space-y-4">
				<div class="text-sm text-[#3D2C2E]">
					<label class="block mb-1 font-medium">Upload Team Logo</label>
					<input type="file" accept="image/*" on:change={handleLogoUpload} class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F6E6C9] file:text-[#A27B5C] hover:file:bg-[#eadbc0]"/>
					{#if teamLogoFile}
						<div class="text-sm text-green-600 mt-1 font-medium">✓ Logo selected</div>
					{/if}
				</div>

				<div>
					<label class="text-sm font-medium">Team Name</label>
					<input
						class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A27B5C] outline-none"
						bind:value={teamName}
						placeholder="e.g. Red Dragons"
					/>
				</div>

				<div class="flex gap-3">
					<div class="w-1/3">
						<label class="text-sm font-medium">Team No.</label>
						<input
							disabled
							class="w-full p-3 rounded-lg bg-gray-100 text-gray-500 border border-gray-200"
							value={tournament ? tournament.teams.length + 1 : 1}
						/>
					</div>

					<div class="flex-1">
						<label class="text-sm font-medium">Tag (Abbr)</label>
						<input
							class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A27B5C] outline-none"
							bind:value={teamTag}
							placeholder="e.g. RDG"
						/>
					</div>
				</div>

				{#if tournament?.roundRobin}
					<div class="p-3 bg-[#F6E6C9]/50 rounded-lg border border-[#A27B5C]/20">
						<label class="text-sm font-bold text-[#A27B5C] block mb-2">Assign to Group</label>
						<div class="flex flex-wrap gap-2">
							{#each groupLabels as grp}
								<button 
									class="w-10 h-10 rounded-lg border font-bold transition-all
									{selectedGroup === grp ? 'bg-[#A27B5C] text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}"
									on:click={() => selectedGroup = grp}
								>
									{grp}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<div>
					<label class="text-sm font-medium">Players (Max 8)</label>
					<div class="space-y-2 mt-2">
						{#each teamPlayers as p, i}
							<div class="flex gap-2">
								<input
									class="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#A27B5C] outline-none"
									bind:value={teamPlayers[i]}
									placeholder={`Player ${i + 1} name`}
								/>
								{#if teamPlayers.length > 1}
									<button
										class="px-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
										on:click={() => removePlayerField(i)}>✕</button
									>
								{/if}
							</div>
						{/each}
					</div>
					{#if teamPlayers.length < 8}
						<button class="mt-2 text-sm font-bold text-[#A27B5C] hover:underline" on:click={addPlayerField}>+ Add Player</button>
					{/if}
				</div>

				<div class="flex gap-2 pt-2">
					<button class="flex-1 py-3 bg-[#A27B5C] text-white font-semibold rounded-lg shadow-md hover:bg-[#8f6a50] transition" on:click={addTeam}
						>Add Team</button
					>
					<a
						class="flex-1 py-3 bg-[#3D2C2E] text-white font-semibold rounded-lg text-center shadow-md hover:bg-[#2a1e20] transition"
						href={`/dashboard`}>Done</a
					>
				</div>
			</div>
		{/if}

		{#if tab === 'entered'}
			<div in:fade class="space-y-6">
				{#if tournament?.teams.length}
					
					{#if tournament.roundRobin}
						{#each groupLabels as groupKey}
							{@const groupTeams = tournament.teams.filter(t => t.group === groupKey)}
							<div class="bg-[#F6E6C9]/30 rounded-xl p-3 border border-[#A27B5C]/20">
								<div class="flex items-center justify-between mb-3 border-b border-[#A27B5C]/20 pb-2">
									<h3 class="text-lg font-bold text-[#A27B5C]">Group {groupKey}</h3>
									<span class="text-xs font-medium text-gray-500">{groupTeams.length} teams</span>
								</div>

								{#if groupTeams.length > 0}
									<div class="space-y-2">
										{#each groupTeams as t (t.id)}
											<TeamCard
												team={t}
												showGroup={false} 
												on:delete={(e) => deleteTeam(e.detail.id)}
											/>
										{/each}
									</div>
								{:else}
									<p class="text-center text-sm text-gray-400 italic py-2">No teams in this group</p>
								{/if}
							</div>
						{/each}

					{:else}
						<div class="space-y-3">
							{#each tournament.teams as t (t.id)}
								<TeamCard
									team={t}
									showGroup={false}
									on:delete={(e) => deleteTeam(e.detail.id)}
								/>
							{/each}
						</div>
					{/if}

				{:else}
					<div class="py-10 text-center text-gray-500">
						<p class="text-lg">No teams added yet.</p>
						<p class="text-sm">Switch to the "Add Team" tab to start.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>