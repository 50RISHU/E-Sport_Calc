<script lang="ts">
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";
	import { tournamentStore, type Tournament } from "$lib/stores/tournamentStore";
	import TeamCard from "$lib/components/TeamCard.svelte";
	import { derived } from "svelte/store";
	import { fade, fly, slide } from "svelte/transition";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { supabase } from "$lib/supabaseClient";
	import type { Session } from "@supabase/supabase-js";


	let id = "";
	let tournament: Tournament | null = null;
	let session: Session | null = null;
	let loading = true;

	onMount(async () => {
		const {data, error} = await supabase.auth.getSession();

		if(error || !data.session) {
			goto('/login');
			return;
		}

		session = data.session;
		loading = false;
	});
	
	let tab: "add" | "entered" = "add";
	let teamName = "";
	let teamTag = "";
	let teamPlayers: string[] = [""];
	let teamLogoFile: File | null = null;
	let selectedGroup = "A";

	$: id = $page.params.id;

	const activeTournament = derived(
		[tournamentStore, page],
		([$list, $page]) => $list.find((t) => t.id === $page.params.id) ?? null
	);

	const unsubscribe = activeTournament.subscribe((v) => {
		tournament = v;
		if (tournament?.roundRobin && !selectedGroup) {
			selectedGroup = "A";
		}
	});
	onDestroy(unsubscribe);

	$: groupLabels = tournament?.roundRobin
		? Array.from({ length: tournament.groupCount }, (_, i) => String.fromCharCode(65 + i))
		: [];

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
			group: tournament.roundRobin ? selectedGroup : null,
			players: teamPlayers.filter((p) => p.trim())
		};

		const res = tournamentStore.addTeam(tournament.id, teamPayload);

		if (!res.ok) return alert(res.error ?? "Failed to add team");

		teamName = "";
		teamTag = "";
		teamPlayers = [""];
		teamLogoFile = null;
	}
	
	function deleteTeam(teamId: string) {
		if (!tournament) return;
		if (confirm("Delete this team?")) {
			tournamentStore.removeTeam(tournament.id, teamId);
		}
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 p-4 md:p-6 font-['Inter'] selection:bg-cyan-500 selection:text-black">
	
	<div class="text-center mb-8 relative z-10" in:fly={{ y: -20, duration: 500 }}>
		<h2 class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-widest drop-shadow-lg">
			{tournament?.name || "Tournament"} <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Roster</span>
		</h2>
		<div class="h-1 w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-2"></div>
	</div>

	<div class="max-w-xl mx-auto bg-[#0E0E10]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 relative overflow-hidden">
		<div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
		
		<div class="flex gap-2 mb-6 bg-black/30 p-1 rounded-lg border border-white/5">
			<button
				class="flex-1 py-2 rounded font-bold font-['Rajdhani'] uppercase tracking-widest text-sm transition-all
				{tab === 'add' 
					? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
					: 'text-gray-500 hover:text-white hover:bg-white/5'}"
				on:click={() => (tab = 'add')}
			>
				<i class="bi bi-plus-lg mr-1"></i> Add Unit
			</button>
			<button
				class="flex-1 py-2 rounded font-bold font-['Rajdhani'] uppercase tracking-widest text-sm transition-all
				{tab === 'entered' 
					? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
					: 'text-gray-500 hover:text-white hover:bg-white/5'}"
				on:click={() => (tab = 'entered')}
			>
				Deployed ({tournament?.teams.length ?? 0})
			</button>
		</div>

		{#if tab === 'add'}
			<div in:fly={{ y: 10, duration: 300 }} class="space-y-5">
				
				<div class="group relative">
					<label class="block mb-2 text-xs font-bold text-cyan-500 uppercase tracking-widest font-mono">Unit Insignia (Logo)</label>
					<div class="relative w-full">
						<input type="file" accept="image/*" on:change={handleLogoUpload} class="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 transition-all cursor-pointer bg-black/20 rounded-lg border border-white/5 p-2"/>
					</div>
					{#if teamLogoFile}
						<div class="absolute top-0 right-0 text-green-400 text-xs font-bold animate-pulse flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
							<i class="bi bi-check-circle-fill"></i> UPLOADED
						</div>
					{/if}
				</div>

				<div>
					<label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Unit Designation</label>
					<input
						class="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-['Rajdhani'] font-bold text-lg tracking-wide uppercase"
						bind:value={teamName}
						placeholder="E.G. RED DRAGONS"
					/>
				</div>

				<div class="flex gap-3">
					<div class="w-1/3">
						<label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">ID #</label>
						<input
							disabled
							class="w-full p-3 rounded-lg bg-white/5 text-gray-500 border border-white/5 font-mono text-center font-bold"
							value={tournament ? (tournament.teams.length + 1).toString().padStart(2, '0') : '01'}
						/>
					</div>

					<div class="flex-1">
						<label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Tag</label>
						<input
							class="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-mono font-bold uppercase"
							bind:value={teamTag}
							placeholder="RDG"
							maxlength="4"
						/>
					</div>
				</div>

				{#if tournament?.roundRobin}
					<div class="p-4 bg-cyan-900/10 rounded-xl border border-cyan-500/20 relative overflow-hidden">
						<div class="absolute -right-4 -top-4 text-cyan-500/10 text-6xl pointer-events-none">
							<i class="bi bi-grid-3x3"></i>
						</div>
						<label class="block mb-3 text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Assign Sector (Group)</label>
						<div class="flex flex-wrap gap-2 relative z-10">
							{#each groupLabels as grp}
								<button 
									class="w-10 h-10 rounded border font-bold font-mono transition-all duration-200
									{selectedGroup === grp 
										? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110' 
										: 'bg-black/40 text-gray-500 border-white/10 hover:border-cyan-500/50 hover:text-cyan-400'}"
									on:click={() => selectedGroup = grp}
								>
									{grp}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<div class="bg-black/20 p-4 rounded-xl border border-white/5">
					<div class="flex justify-between items-center mb-3">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Squad Members</label>
						<span class="text-[10px] text-gray-600 font-mono">{teamPlayers.length} / 8 SLOTS</span>
					</div>
					
					<div class="space-y-2">
						{#each teamPlayers as p, i}
							<div class="flex gap-2" in:slide|local>
								<div class="flex items-center justify-center w-8 h-auto bg-white/5 rounded border border-white/5 text-[10px] text-gray-500 font-mono">
									{i + 1}
								</div>
								<input
									class="flex-1 p-2 rounded bg-black/40 border border-white/10 text-white placeholder-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-medium"
									bind:value={teamPlayers[i]}
									placeholder="OPERATIVE NAME"
								/>
								{#if teamPlayers.length > 1}
									<button
										class="w-10 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-900/30 rounded transition-colors"
										on:click={() => removePlayerField(i)}><i class="bi bi-x-lg"></i></button
									>
								{/if}
							</div>
						{/each}
					</div>
					{#if teamPlayers.length < 8}
						<button 
							class="mt-3 w-full py-2 border border-dashed border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-900/10 rounded text-xs font-bold uppercase tracking-widest transition-all"
							on:click={addPlayerField}
						>
							+ Add Operative
						</button>
					{/if}
				</div>

				<div class="flex gap-3 pt-4 border-t border-white/5">
					<button 
						class="flex-[2] py-4 rounded-lg bg-gradient-to-r from-cyan-700 to-cyan-500 hover:from-cyan-600 hover:to-cyan-400 text-white font-black font-['Rajdhani'] text-lg tracking-[0.15em] shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
						on:click={addTeam}
					>
						CONFIRM UNIT
					</button>
					<a
						class="flex-1 py-4 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white font-bold font-['Rajdhani'] uppercase tracking-widest transition-all text-sm"
						href={`/dashboard`}
					>
						Done
					</a>
				</div>
			</div>
		{/if}

		{#if tab === 'entered'}
			<div in:fade class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
				{#if tournament?.teams.length}
					
					{#if tournament.roundRobin}
						{#each groupLabels as groupKey}
							{@const groupTeams = tournament.teams.filter(t => t.group === groupKey)}
							<div class="mb-4 last:mb-0">
								<div class="flex items-center gap-3 mb-2">
									<div class="h-px flex-1 bg-white/10"></div>
									<h3 class="text-sm font-bold text-cyan-500 font-mono">SECTOR {groupKey}</h3>
									<div class="h-px flex-1 bg-white/10"></div>
								</div>

								{#if groupTeams.length > 0}
									<div class="grid grid-cols-1 gap-2">
										{#each groupTeams as t (t.id)}
											<TeamCard
												team={t}
												showGroup={false} 
												on:delete={(e) => deleteTeam(e.detail.id)}
											/>
										{/each}
									</div>
								{:else}
									<p class="text-center text-xs text-gray-600 italic py-2 font-mono">SECTOR EMPTY</p>
								{/if}
							</div>
						{/each}

					{:else}
						<div class="grid grid-cols-1 gap-2">
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
					<div class="py-12 text-center flex flex-col items-center justify-center opacity-50">
						<i class="bi bi-people text-4xl mb-2"></i>
						<p class="text-sm font-['Rajdhani'] uppercase tracking-widest">No units deployed</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
</style>