<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';


	let tournamentId = "";
	let tournament: Tournament | null = null;
	let saveMessage = ""; 
	let session: Session | null = null;
	let loading = true;

	$: tournamentId = $page.params.id;

	onMount(async () => {
		const {data, error} = await supabase.auth.getSession();

		if(error || !data.session) {
			goto('/login');
			return;
		}

		session = data.session;
		loading = false;
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		if (tournamentId) {
			tournament = list.find((t) => t.id === tournamentId) ?? null;
		}
	});

	onMount(() => {
		const list = $tournamentStore;
		tournament = list.find((t) => t.id === tournamentId) ?? null;
	});

	function updateKillPoints() {
		if (!tournament) return;
		tournamentStore.updateKillPoints(tournamentId, tournament.scoring.killPoints);
	}

	function updatePositionPoints() {
		if (!tournament) return;
		tournamentStore.updatePositionPoints(tournamentId, tournament.scoring.positions);
	}

	function saveAsDefault() {
		if (!tournament) return;
		tournamentStore.saveDefaultScoring(tournament.scoring);
		
		saveMessage = "CONFIGURATION SAVED AS SYSTEM DEFAULT";
		setTimeout(() => saveMessage = "", 3000);
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>

{#if tournament}
<div class="min-h-screen flex justify-center items-start py-10 px-4 font-['Inter'] text-slate-200">

	<div 
		class="w-full max-w-3xl bg-[#0E0E10]/90 backdrop-blur-xl shadow-2xl rounded-xl p-6 md:p-8 border border-white/10 relative overflow-hidden"
		in:fly={{ y: 20, duration: 500 }}
	>
		<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>

		<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
			<div>
				<h1 class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
					Scoring <span class="text-cyan-500">Matrix</span>
				</h1>
				<p class="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Configure point distribution parameters</p>
			</div>
			
			<button 
				on:click={saveAsDefault}
				class="text-[10px] font-bold text-cyan-500 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/10 px-3 py-2 rounded uppercase tracking-widest transition-all flex items-center gap-2"
			>
				<i class="bi bi-save"></i> Save as Default
			</button>
		</div>

		<div class="mb-8 p-6 rounded-xl bg-black/40 border border-white/5 relative group hover:border-cyan-500/30 transition-colors">
			<div class="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition-opacity">
				<i class="bi bi-crosshair text-4xl text-red-500"></i>
			</div>
			
			<label class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 block">Kill Points (Per Elimination)</label>
			<div class="flex items-center gap-4">
				<input 
					type="number"
					bind:value={tournament.scoring.killPoints}
					on:input={updateKillPoints}
					class="px-4 py-3 rounded-lg w-32 bg-[#151518] border border-white/10 text-white text-2xl font-bold font-['Rajdhani'] focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-inner text-center"
				/>
				<span class="text-sm text-gray-500 font-mono">PTS / KILL</span>
			</div>
		</div>

		<div class="mb-4">
			<h2 class="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider mb-4 border-l-4 border-purple-500 pl-3">
				Placement Points
			</h2>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
			{#each tournament.scoring.positions as pos, i}
			<div class="flex flex-col items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
				<span class="text-xs font-bold text-gray-500 mb-2 font-mono">RANK #{pos.place}</span>
				<input 
					type="number"
					bind:value={tournament.scoring.positions[i].points}
					on:input={updatePositionPoints}
					class="w-full px-2 py-2 rounded bg-black/50 border border-white/10 text-center text-white font-bold font-['Rajdhani'] text-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
				/>
			</div>
			{/each}
		</div>

		{#if saveMessage}
			<div in:fade class="mb-6 p-3 bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono text-center rounded tracking-widest">
				<i class="bi bi-check-circle-fill mr-2"></i> {saveMessage}
			</div>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
			<button
				class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold font-['Rajdhani'] uppercase tracking-widest rounded-lg border border-white/5 transition-all text-sm"
				on:click={saveAsDefault}
			>
				Save Preset
			</button>

			<button
				class="flex-[2] py-4 bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-black font-['Rajdhani'] text-xl tracking-[0.15em] rounded-lg shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
				on:click={() => goto(`/tournament/${tournamentId}/teams`)}
			>
				CONFIRM & NEXT
			</button>
		</div>
	</div>

</div>
{/if}