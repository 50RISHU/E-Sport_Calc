<script lang="ts">
	import type { Tournament } from '$lib/stores/tournamentStore';
	import { tournamentStore } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';

	let { tournament } = $props<{ tournament: Tournament }>();
	
	// Local state for renaming
	// svelte-ignore state_referenced_locally
		let newName = $state(tournament.name);
	let isSaving = $state(false);

	async function handleRename() {
		if(newName === tournament.name) return;
		// Ideally you add a rename method to store, but for now we assume logic exists or future update
		// Just a placeholder alert for the requirement
		alert("Rename functionality coming in next update."); 
	}

	async function handleDelete() {
		const confirmName = prompt(`To delete this tournament, type "${tournament.name}":`);
		if (confirmName === tournament.name) {
			await tournamentStore.removeTournament(tournament.id);
			goto('/dashboard');
		} else {
			alert("Name did not match.");
		}
	}
</script>

<div class="max-w-2xl space-y-8">
	
	<div class="bg-[#0E0E10] border border-white/5 p-6 rounded-xl">
		<h3 class="text-lg font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
			<i class="bi bi-sliders text-cyan-500 mr-2"></i> Game Rules
		</h3>
		<p class="text-sm text-gray-500 mb-4">Configure points per kill, placement points matrix, and scoring presets.</p>
		<button 
			onclick={() => goto(`/tournament/${tournament.id}/points`)}
			class="w-full py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-white rounded font-bold uppercase text-xs tracking-widest transition-all"
		>
			Manage Points System
		</button>
	</div>

	<div class="bg-[#0E0E10] border border-white/5 p-6 rounded-xl">
		<h3 class="text-lg font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
			<i class="bi bi-pencil-square text-purple-500 mr-2"></i> General
		</h3>
		
		<div class="space-y-4">
			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tournament Name</label>
				<div class="flex gap-2">
					<input 
						type="text" 
						bind:value={newName}
						class="flex-1 bg-black/40 border border-white/10 rounded p-3 text-white font-bold font-['Rajdhani'] focus:border-purple-500 outline-none"
					/>
					<button 
						onclick={handleRename}
						class="px-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-xs rounded border border-white/5"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="bg-red-900/5 border border-red-500/20 p-6 rounded-xl">
		<h3 class="text-lg font-bold text-red-500 font-['Rajdhani'] uppercase tracking-wider mb-4 border-b border-red-500/20 pb-2">
			<i class="bi bi-exclamation-triangle-fill mr-2"></i> Danger Zone
		</h3>
		<p class="text-sm text-red-400/60 mb-4">Once you delete a tournament, there is no going back. All teams, matches, and points data will be permanently removed.</p>
		<button 
			onclick={handleDelete}
			class="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold uppercase text-xs tracking-widest rounded border border-red-500/30 transition-all"
		>
			Delete Tournament
		</button>
	</div>

</div>