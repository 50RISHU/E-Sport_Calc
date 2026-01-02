<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { fly, fade } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import PointCard from '$lib/components/PointCard.svelte';

	// --- 1. SETUP ---
	let tournamentId: string = $page.params.id ?? '';
	let tournament: Tournament | null = null;

	// Default: 20 Ranks
	let localScoring = {
		killPoints: 1,
		positions: Array.from({ length: 20 }, (_, i) => ({ place: i + 1, points: 0 }))
	};

	let loading = true;
	let saving = false;
	let initialized = false;
	let toastMessage = '';

	// Template (Preset) State
	let showTemplateModal = false;
	let userTemplates: any[] = [];

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) goto('/login');

		if ($tournamentStore.length === 0) {
			await tournamentStore.loadTournaments();
		}
		loading = false;
	});

	// --- 2. INTELLIGENT LOAD ---
	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === tournamentId);

		if (found) {
			tournament = found;

			if (!initialized) {
				// Check "Last Used" memory from Local Storage
				const memory = localStorage.getItem('esports_last_points');

				// Is this a fresh tournament (Default points)?
				const isFresh =
					found.scoring.positions.length > 0 && found.scoring.positions[0].points === 15;

				if (isFresh && memory) {
					localScoring = JSON.parse(memory);
					showToast('Restored last used points');
				} else {
					// Load saved tournament data
					localScoring = JSON.parse(JSON.stringify(found.scoring));
				}

				ensure20Ranks();
				initialized = true;
			}
		}
	});

	onDestroy(unsubscribe);

	// Helper to ensure UI always shows 20 boxes
	function ensure20Ranks() {
		if (localScoring.positions.length < 20) {
			const currentLen = localScoring.positions.length;
			for (let i = currentLen; i < 20; i++) {
				localScoring.positions.push({ place: i + 1, points: 0 });
			}
		}
	}

	// --- 3. TOURNAMENT ACTIONS ---

	// Option 4: Save for Tournament (and Local Memory)
	async function saveForTournament() {
		if (!tournament) return;
		saving = true;

		// Clean data before sending to avoid proxy errors
		const cleanData = JSON.parse(JSON.stringify(localScoring));

		// A. Save to Database (Active Tournament)
		await tournamentStore.updateScoring(tournament.id, cleanData);

		// B. Save to Local Memory (For next time)
		localStorage.setItem('esports_last_points', JSON.stringify(cleanData));

		saving = false;
		showToast('Points Saved Successfully');
	}

	// --- 4. TEMPLATE (PRESET) ACTIONS ---

	async function openTemplateModal() {
		userTemplates = await tournamentStore.getUserPresets();
		showTemplateModal = true;
	}

	// Option 1: Save New Preset
	async function saveNewTemplate() {
		const name = prompt("Name this template (e.g. 'Battle Royale Standard'):");
		if (!name) return;

		const cleanData = JSON.parse(JSON.stringify(localScoring));
		const result = await tournamentStore.savePreset(name, cleanData);
		if (result) {
			userTemplates = [result, ...userTemplates]; // Update list immediately
			showToast('New Template Created');
		}
	}

	// Option 2: Load Preset
	function loadTemplate(template: any) {
		if (confirm(`Load "${template.name}"? This will replace current numbers.`)) {
			localScoring = JSON.parse(JSON.stringify(template.scoring));
			ensure20Ranks();
			showTemplateModal = false;
			showToast(`Loaded: ${template.name}`);
		}
	}

	// Option 3: Update Selected Preset
	async function updateTemplate(templateId: string, templateName: string) {
		if (confirm(`Update "${templateName}" with these new numbers?`)) {
			const cleanData = JSON.parse(JSON.stringify(localScoring));
			const updated = await tournamentStore.updatePreset(templateId, cleanData);

			if (updated) {
				// Refresh list to show change
				userTemplates = userTemplates.map((t) => (t.id === templateId ? updated : t));
				showToast(`Template "${templateName}" Updated`);
			} else {
				alert('Update failed. Check database permissions.');
			}
		}
	}

	async function deleteTemplate(id: string) {
		if (confirm('Delete this template permanently?')) {
			await tournamentStore.deletePreset(id);
			userTemplates = userTemplates.filter((t) => t.id !== id);
		}
	}

	// --- UTILS ---
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => (toastMessage = ''), 3000);
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div
	class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"
></div>
<div
	class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"
></div>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div
			class="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"
		></div>
	</div>
{:else if tournament}
	<div
		class="min-h-screen flex justify-center items-start py-10 px-4 font-['Inter'] text-slate-200 relative"
	>
		<div class="flex flex-col w-full max-w-4xl mt-12 md:mt-4">
			<div
				class="w-full bg-[#0E0E10]/90 backdrop-blur-xl shadow-2xl rounded-xl p-6 md:p-8 border border-white/10 relative overflow-hidden"
				in:fly={{ y: 20, duration: 500 }}
			>
				<div
					class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 via-purple-500 to-cyan-500"
				></div>

				<div
					class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6"
				>
					<div>
						<h1
							class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-wider"
						>
							Points <span class="text-cyan-500">System</span>
						</h1>
						<p class="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">
							Tournament: {tournament.name}
						</p>
					</div>

					<div class="flex flex-wrap gap-2">
						<button
							onclick={openTemplateModal}
							class="text-xs font-bold text-cyan-400 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/10 px-4 py-2 rounded uppercase tracking-widest transition-all shadow-lg shadow-cyan-900/20"
						>
							<i class="bi bi-folder2-open mr-2"></i> Templates
						</button>
					</div>
				</div>

				<div
					class="mb-8 p-6 rounded-xl bg-black/40 border border-white/5 relative group hover:border-red-500/30 transition-colors flex flex-col md:flex-row items-center justify-between gap-4"
				>
					<div class="flex items-center gap-4">
						<div class="p-4 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20">
							<i class="bi bi-crosshair text-2xl"></i>
						</div>
						<div>
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="text-sm font-bold text-white uppercase tracking-widest block"
								>Points Per Kill</label
							>
							<span class="text-xs text-gray-500 font-mono">SCORE ADDED FOR EACH ELIMINATION</span>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<input
							type="number"
							min="0"
							bind:value={localScoring.killPoints}
							class="px-4 py-3 rounded-lg w-32 bg-[#151518] border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-inner text-center"
						/>
						<span
							class="text-xs font-bold text-red-500/50 uppercase tracking-widest rotate-90 origin-left translate-y-4"
							>PTS</span
						>
					</div>
				</div>

				<div class="mb-4 flex items-center gap-4">
					<h2
						class="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider border-l-4 border-purple-500 pl-3"
					>
						Rank Points
					</h2>
					<div class="h-px flex-1 bg-white/5"></div>
				</div>

				<div
					class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
				>
					{#each localScoring.positions as pos, i}
						<PointCard rank={pos.place} bind:points={localScoring.positions[i].points} />
					{/each}
				</div>

				{#if toastMessage}
					<div
						in:fly={{ y: 10, duration: 300 }}
						class="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold font-mono text-center rounded-lg tracking-widest flex items-center justify-center gap-2"
					>
						<i class="bi bi-check-circle-fill"></i>
						{toastMessage}
					</div>
				{/if}

				<div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
					<button
						disabled={saving}
						class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 font-bold font-['Rajdhani'] uppercase tracking-widest rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
						onclick={saveForTournament}
					>
						{#if saving}
							<span class="animate-pulse">Saving...</span>
						{:else}
							<i class="bi bi-save"></i> Save Points
						{/if}
					</button>

					<button
						class="flex-2 py-4 bg-linear-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-black font-['Rajdhani'] text-xl tracking-[0.15em] rounded-lg shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
						onclick={() => {
							saveForTournament();
							goto(`/tournament/${tournamentId}/teams`);
						}}
					>
						{#if saving}
							<span class="animate-pulse">Saving...</span>
						{:else}
							<span class="relative z-10">Manage Teams <i class="bi bi-arrow-right ml-2"></i></span>
							<div
								class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
							></div>
						{/if}
					</button>
				</div>
			</div>

			<div class="mt-8 mb-20 w-full" in:fade={{ delay: 200, duration: 500 }}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="bg-white/5 border border-white/5 rounded-xl p-6">
						<h3
							class="text-cyan-400 font-bold font-['Rajdhani'] uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<i class="bi bi-info-circle"></i> System Guide
						</h3>
						<ul class="space-y-3 text-sm text-gray-400">
							<li class="flex gap-3">
								<span
									class="text-white font-bold bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs shrink-0"
									>1</span
								>
								<span>
									<strong class="text-gray-300">Editing Points:</strong>
									Click any box to change points. Changes are temporary until you save.
								</span>
							</li>
							<li class="flex gap-3">
								<span
									class="text-white font-bold bg-white/10 w-6 h-6 rounded flex items-center justify-center text-xs shrink-0"
									>2</span
								>
								<span>
									<strong class="text-gray-300">Saving:</strong>
									Click
									<span class="text-white bg-white/10 px-1 rounded text-xs uppercase"
										>Save Points</span
									> to apply these rules to this tournament.
								</span>
							</li>
						</ul>
					</div>

					<div class="bg-white/5 border border-white/5 rounded-xl p-6">
						<h3
							class="text-purple-400 font-bold font-['Rajdhani'] uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<i class="bi bi-cloud-check"></i> Managing Templates
						</h3>
						<ul class="space-y-3 text-sm text-gray-400">
							<li class="flex items-start gap-3">
								<i class="bi bi-cloud-upload text-cyan-500 mt-0.5"></i>
								<span>
									<strong class="text-gray-300">Create New:</strong>
									Setup points, then click "Templates" > "Save New" to create a reusable preset (e.g.
									PUBG).
								</span>
							</li>
							<li class="flex items-start gap-3">
								<i class="bi bi-arrow-repeat text-yellow-500 mt-0.5"></i>
								<span>
									<strong class="text-gray-300">Update Existing:</strong>
									Open Templates. Click <i class="bi bi-arrow-repeat text-yellow-500"></i> next to a preset
									to overwrite it with your current points.
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if showTemplateModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-default"
			transition:fade={{ duration: 200 }}
			onclick={() => (showTemplateModal = false)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (showTemplateModal = false)}
		>
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="w-full max-w-md bg-[#151518] border border-white/10 rounded-xl shadow-2xl overflow-hidden cursor-auto"
				in:fly={{ y: 20 }}
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<div class="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
					<h3 class="text-white font-bold font-['Rajdhani'] uppercase tracking-widest">
						Saved Templates
					</h3>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						onclick={() => (showTemplateModal = false)}
						class="text-gray-500 hover:text-white transition-colors"
					>
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				<div class="p-4 bg-black/20 border-b border-white/5">
					<button
						onclick={saveNewTemplate}
						class="w-full py-3 border border-dashed border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 rounded-lg font-bold uppercase text-xs tracking-widest transition-all"
					>
						<i class="bi bi-plus-lg mr-1"></i> Save current points as New Template
					</button>
				</div>

				<div class="p-2 max-h-60 overflow-y-auto custom-scrollbar">
					{#if userTemplates.length === 0}
						<div class="p-6 text-center text-gray-500 text-sm font-mono">No templates found.</div>
					{:else}
						{#each userTemplates as tmpl}
							<div
								class="flex items-center gap-2 p-3 hover:bg-white/5 rounded-lg group transition-colors border border-transparent hover:border-white/5"
							>
								<button class="flex-1 text-left" onclick={() => loadTemplate(tmpl)}>
									<div class="flex items-center gap-2">
										<div class="text-white font-bold text-sm uppercase">{tmpl.name}</div>
									</div>
									<div class="text-[10px] text-gray-500 font-mono mt-0.5">
										Kill: {tmpl.scoring.killPoints} | 1st: {tmpl.scoring.positions[0]?.points}
									</div>
								</button>

								<div class="flex items-center gap-1">
									<button
										onclick={() => updateTemplate(tmpl.id, tmpl.name)}
										class="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors"
										title="Update this template with current points"
									>
										<i class="bi bi-arrow-repeat text-lg"></i>
									</button>

									<button
										onclick={() => deleteTemplate(tmpl.id)}
										class="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
										title="Delete Template"
									>
										<i class="bi bi-trash"></i>
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
