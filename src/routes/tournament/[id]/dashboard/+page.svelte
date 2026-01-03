<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';

	import TeamsTab from '$lib/components/dashboard/TeamsTab.svelte';
	import MatchesTab from '$lib/components/dashboard/MatchesTab.svelte';
	import LeaderboardTab from '$lib/components/dashboard/LeaderboardTab.svelte';
	import SettingsTab from '$lib/components/dashboard/SettingsTab.svelte';

	let tournamentId: string = $page.params.id ?? '';
	let tournament: Tournament | null = $state(null);
	let activeTab: 'teams' | 'matches' | 'leaderboard' | 'settings' = $state('teams');
	let loading = $state(true);

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		if (error || !data.session) goto('/login');

		if ($tournamentStore.length === 0) await tournamentStore.loadTournaments();
		loading = false;
	});

	const unsubscribe = tournamentStore.subscribe((list) => {
		const found = list.find((t) => t.id === tournamentId);
		if (found) tournament = found;
	});
	onDestroy(unsubscribe);
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl -z-40 pointer-events-none"></div>

<div class="min-h-screen text-slate-200 font-['Inter'] relative flex flex-col">
	
	<div class="bg-[#0E0E10]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<button onclick={() => goto('/dashboard')} class="text-gray-500 hover:text-white transition-colors">
					<i class="bi bi-arrow-left text-xl"></i>
				</button>
				<div>
					<h1 class="font-['Rajdhani'] font-bold text-xl text-white uppercase tracking-wider leading-none">
						{tournament?.name ?? 'Loading...'}
					</h1>
					<span class="text-[10px] text-cyan-500 font-mono">DASHBOARD // ID: {tournamentId.slice(0,4)}</span>
				</div>
			</div>
			
			<div class="hidden md:block">
				<span class="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded uppercase">
					Active
				</span>
			</div>
		</div>

		<div class="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto custom-scrollbar">
			{#each ['teams', 'matches', 'leaderboard', 'settings'] as tab}
				<button
					onclick={() => activeTab = tab as any}
					class="py-3 text-xs font-bold uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap
					{activeTab === tab ? 'text-cyan-400 border-cyan-500' : 'text-gray-500 border-transparent hover:text-gray-300'}"
				>
					{tab}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
		{#if loading}
			<div class="flex justify-center pt-20">
				<div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if tournament}
			
			{#key activeTab}
				<div in:fly={{ y: 10, duration: 300 }}>
					{#if activeTab === 'teams'}
						<TeamsTab {tournament} />
					{:else if activeTab === 'matches'}
						<MatchesTab {tournament} />
					{:else if activeTab === 'leaderboard'}
						<LeaderboardTab {tournament} />
					{:else if activeTab === 'settings'}
						<SettingsTab {tournament} />
					{/if}
				</div>
			{/key}

		{:else}
			<div class="text-center pt-20 text-gray-500">Tournament not found.</div>
		{/if}
	</div>
</div>