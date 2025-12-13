<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';

	let tournamentId = "";
	let tournament: Tournament | null = null;

	// Set ID BEFORE subscribing
	$: tournamentId = $page.params.id;

	// Subscribe to store reactively
	const unsubscribe = tournamentStore.subscribe((list) => {
		if (tournamentId) {
			tournament = list.find((t) => t.id === tournamentId) ?? null;
		}
	});

	onMount(() => {
		// ensure initial update
		const list = $tournamentStore;
		tournament = list.find((t) => t.id === tournamentId) ?? null;
	});

	// HANDLERS
	function updateKillPoints() {
		if (!tournament) return;
		tournamentStore.updateKillPoints(tournamentId, tournament.scoring.killPoints);
	}

	function updatePositionPoints() {
		if (!tournament) return;
		tournamentStore.updatePositionPoints(tournamentId, tournament.scoring.positions);
	}
</script>

{#if tournament}
<div class="min-h-screen flex justify-center items-start py-10 bg-[#DCD7C9]">

	<div class="w-full max-w-3xl mx-3 backdrop-blur-xl shadow-xl rounded-2xl p-8 bg-white border border-[#A27B5C]/30 animate-fadeIn">
		<h1 class="text-3xl font-bold text-[#3D2C2E] mb-6">Set Tournament Points</h1>

		<!-- Kill Points -->
		<div class="mb-6 p-5 rounded-xl bg-[#F6E6C9] border border-[#A27B5C]/40">
			<label class="font-semibold block text-[#3D2C2E] mb-2">Kill Points</label>
			<input 
				type="number"
				bind:value={tournament.scoring.killPoints}
				on:input={updateKillPoints}
				class="px-4 py-2 rounded-lg w-32 shadow border border-gray-300"
			/>
		</div>

		<!-- Positions -->
		<h2 class="text-2xl font-semibold mb-3 text-[#3D2C2E]">Position Points</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each tournament.scoring.positions as pos, i}
			<div class="flex items-center gap-4 p-4 bg-[#F6E6C9] rounded-xl border border-[#A27B5C]/40">
				<span class="text-xl font-bold w-10">{pos.place}.</span>

				<input 
					type="number"
					bind:value={tournament.scoring.positions[i].points}
					on:input={updatePositionPoints}
					class="px-3 py-2 rounded-lg w-24 shadow border border-gray-300"
				/>
			</div>
			{/each}
		</div>

		<button
			class="w-full py-3 mt-3 bg-[#A27B5C] text-white rounded-xl font-semibold text-lg shadow-md hover:bg-[#8F6A50]"
			on:click={() => goto(`/tournament/${tournamentId}/teams`)}
		>
			N E X T
		</button>
	</div>

</div>
{/if}

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.animate-fadeIn { animation: fadeIn 0.5s ease-out; }
</style>
