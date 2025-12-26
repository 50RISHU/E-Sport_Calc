<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';

	let tournamentId = $page.params.id;
	let tournament: Tournament | null = null;
	let session: Session | null = null;

	// Local State
	let localScoring = {
		killPoints: 1,
		positions: Array.from({ length: 20 }, (_, i) => ({ place: i + 1, points: 0 }))
	};

	let loading = true;
	let saving = false;
	let initialized = false;
	let saveMessage = '';

	// Preset Modal State
	let showPresetModal = false;
	let userPresets: any[] = [];

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) {
			goto('/login');
			return;
		}
		session = data.session;

		if ($tournamentStore.length === 0) {
			await tournamentStore.loadTournaments();
		}
		loading = false;
	});

	// --- SMART SUBSCRIPTION ---
	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === tournamentId);

		if (found) {
			tournament = found;

			// Run this logic only once when the page loads
			if (!initialized) {
				// 1. Try to get "Last Used" from Local Storage (Fastest)
				const savedPreset = localStorage.getItem('esports_preset_scoring');

				// Check if current tournament is "Default" (Freshly created)
				const isDefault =
					found.scoring.positions.length > 0 && found.scoring.positions[0].points === 15;

				if (isDefault && savedPreset) {
					localScoring = JSON.parse(savedPreset);
					showToast('AUTO-LOADED PREVIOUS CONFIGURATION');
				} else {
					// Otherwise use what is in the DB
					localScoring = JSON.parse(JSON.stringify(found.scoring));
				}
				initialized = true;
			} else if (!saving) {
				// Prevent overwriting if we are currently saving
			}
		}
	});

	onDestroy(unsubscribe);

	// --- DATABASE ACTIONS ---

	async function saveConfiguration() {
		if (!tournament) return;
		saving = true;

		// 1. Update the actual Tournament in DB
		await tournamentStore.updateScoring(tournamentId, localScoring);

		// 2. Update Local Storage "Cache" for next time auto-load
		localStorage.setItem('esports_preset_scoring', JSON.stringify(localScoring));

		saving = false;
		showToast('CONFIGURATION SYNCED & SAVED');
	}

	// --- CLOUD PRESET ACTIONS ---

	async function openPresetModal() {
		// Fetch presets from Supabase via Store
		userPresets = await tournamentStore.getUserPresets();
		showPresetModal = true;
	}

	async function saveToCloud() {
		const name = prompt("Enter a name for this scoring preset (e.g., 'PUBG Format'):");
		if (!name) return;

		const result = await tournamentStore.savePreset(name, localScoring);
		if (result) {
			showToast('PRESET SAVED TO CLOUD');
		}
	}

	function applyPreset(preset: any) {
		localScoring = preset.scoring;
		showPresetModal = false;
		showToast(`LOADED: ${preset.name}`);
	}

	async function deletePreset(id: string) {
		if (confirm('Delete this preset permanently from all devices?')) {
			await tournamentStore.deletePreset(id);
			userPresets = userPresets.filter((p) => p.id !== id); // Update UI
		}
	}

	function showToast(msg: string) {
		saveMessage = msg;
		setTimeout(() => (saveMessage = ''), 3000);
	}
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
		<button
			on:click={() => goto('/dashboard')}
			class="absolute top-6 left-6 hidden md:flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-widest font-mono z-20"
		>
			<i class="bi bi-arrow-left"></i> Return to Command
		</button>

		<div
			class="w-full max-w-4xl bg-[#0E0E10]/90 backdrop-blur-xl shadow-2xl rounded-xl p-6 md:p-8 border border-white/10 relative overflow-hidden mt-12 md:mt-4"
			in:fly={{ y: 20, duration: 500 }}
		>
			<div
				class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"
			></div>

			<div
				class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6"
			>
				<div>
					<h1
						class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-wider"
					>
						Scoring <span class="text-cyan-500">Matrix</span>
					</h1>
					<p class="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">
						ID: {tournament.id.slice(0, 4)} // Configure Tactical Metrics
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<button
						on:click={openPresetModal}
						class="text-[10px] font-bold text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-2 rounded uppercase tracking-widest transition-all"
					>
						<i class="bi bi-cloud-download mr-1"></i> Load Preset
					</button>

					<button
						on:click={saveToCloud}
						class="text-[10px] font-bold text-cyan-500 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/10 px-3 py-2 rounded uppercase tracking-widest transition-all"
					>
						<i class="bi bi-cloud-upload mr-1"></i> Save Preset
					</button>

					<button
						on:click={() => goto('/dashboard')}
						class="text-[10px] font-bold text-purple-400 hover:text-white border border-purple-500/30 hover:bg-purple-500/10 px-3 py-2 rounded uppercase tracking-widest transition-all"
					>
						<i class="bi bi-people-fill mr-1"></i> Dashboard
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
						<label class="text-sm font-bold text-white uppercase tracking-widest block"
							>Kill Points</label
						>
						<span class="text-xs text-gray-500 font-mono">POINTS AWARDED PER ELIMINATION</span>
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
					Placement Points
				</h2>
				<div class="h-px flex-1 bg-white/5"></div>
			</div>

			<div
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
			>
				{#each localScoring.positions as pos, i}
					<div
						class="flex flex-col items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group relative overflow-hidden"
					>
						<div
							class="absolute top-0 right-0 text-[40px] font-black text-white/[0.02] pointer-events-none font-['Rajdhani'] -translate-y-2 translate-x-2"
						>
							#{pos.place}
						</div>
						<span class="text-[10px] font-bold text-cyan-600 mb-2 font-mono tracking-widest"
							>RANK #{pos.place}</span
						>
						<input
							type="number"
							min="0"
							bind:value={localScoring.positions[i].points}
							class="w-full px-2 py-2 rounded bg-black/50 border border-white/10 text-center text-white font-bold font-['Rajdhani'] text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
						/>
					</div>
				{/each}
			</div>

			{#if saveMessage}
				<div
					in:fly={{ y: 10, duration: 300 }}
					class="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold font-mono text-center rounded-lg tracking-widest flex items-center justify-center gap-2"
				>
					<i class="bi bi-check-circle-fill"></i>
					{saveMessage}
				</div>
			{/if}

			<div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
				<!-- <button
					disabled={saving}
					class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 font-bold font-['Rajdhani'] uppercase tracking-widest rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
					on:click={saveConfiguration}
				>
					{#if saving}
						<div
							class="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"
						></div>
						Syncing...
					{:else}
						<i class="bi bi-cloud-arrow-up-fill"></i> Update Configuration
					{/if}
				</button> -->

				<button
					class="flex-[2] py-4 bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-black font-['Rajdhani'] text-xl tracking-[0.15em] rounded-lg shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
					on:click={() => {
						saveConfiguration();
						goto(`/tournament/${tournamentId}/teams`);
					}}
				>
					{#if saving}
						<div
							class="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"
						></div>
						Saving points...
					{:else}
						<span class="relative z-10">Manage Teams</span>
						<div
							class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
						></div>
					{/if}
				</button>
			</div>
		</div>
	</div>

	{#if showPresetModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
		>
			<div
				class="w-full max-w-md bg-[#151518] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
				in:fly={{ y: 20 }}
			>
				<div class="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
					<h3 class="text-white font-bold font-['Rajdhani'] uppercase tracking-widest">
						Select Preset
					</h3>
					<button on:click={() => (showPresetModal = false)}
						><i class="bi bi-x-lg text-gray-500 hover:text-white"></i></button
					>
				</div>
				<div class="p-2 max-h-60 overflow-y-auto custom-scrollbar">
					{#if userPresets.length === 0}
						<div class="p-6 text-center text-gray-500 text-sm font-mono">
							No cloud presets found. Save one first!
						</div>
					{:else}
						{#each userPresets as preset}
							<div class="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg group">
								<button class="flex-1 text-left" on:click={() => applyPreset(preset)}>
									<div class="text-cyan-400 font-bold text-sm uppercase">{preset.name}</div>
									<div class="text-[10px] text-gray-500 font-mono">
										Kill Pts: {preset.scoring.killPoints} | 1st: {preset.scoring.positions[0]
											?.points}
									</div>
								</button>
								<button
									on:click={() => deletePreset(preset.id)}
									class="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<i class="bi bi-trash"></i>
								</button>
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
