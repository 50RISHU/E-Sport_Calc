<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import logo from '$lib/images/esport-logo.png'; // Ensure path is correct
	import { supabase } from '$lib/supabaseClient';
	import type { Session } from '@supabase/supabase-js';

	// --- Props (Optional: allow parent to pass session to avoid double fetch) ---
	export let session: Session | null = null;
	export let userProfile: any = null;

	// --- Local State ---
	let navOpen = false;
	let loading = !session; // Only load if session wasn't passed via props

	// --- Logic ---
	const fetchProfile = async (userId: string) => {
		const { data, error } = await supabase
			.from('profiles')
			.select('full_name')
			.eq('id', userId)
			.single();

		if (!error && data) userProfile = data;
	};

	onMount(() => {
		// Initial Check
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
			if (session && !userProfile) fetchProfile(session.user.id);
			loading = false;
		});

		// Auth Listener
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_e, _s) => {
			session = _s;
			if (_s) fetchProfile(_s.user.id);
			else userProfile = null;
			loading = false;
		});

		return () => subscription.unsubscribe();
	});

	const handleLogout = async () => {
		await supabase.auth.signOut();
		userProfile = null;
		navOpen = false;
		goto('/login');
	};

	const closeMenu = () => (navOpen = false);

	// Navigation Links Configuration (Scalable)
	const navLinks = [
		{ label: 'About', href: '/' },
		{ label: 'Store', href: '/' }
	];
</script>

<nav
	class="sticky top-0 z-50 w-full bg-[#0E0E10]/95 backdrop-blur-md border-b border-cyan-500/20 text-slate-200 font-['Rajdhani'] shadow-lg transition-all duration-300"
>
	<div class="container mx-auto px-4 py-3">
		<div class="flex items-center justify-between">
			
			<button
				class="flex items-center gap-3 group focus:outline-none"
				on:click={() => {
					goto(session ? '/dashboard' : '/');
					closeMenu();
				}}
			>
				<div class="relative">
					<div
						class="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500"
					></div>
					<img
						src={logo}
						alt="EsportCalc Logo"
						class="relative z-10 w-9 h-9 md:w-10 md:h-10 rounded-full border border-cyan-500/50 shadow-sm transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
				<span class="font-black text-white text-lg md:text-xl tracking-widest uppercase">
					Esport<span class="text-cyan-500">Calc</span>
				</span>
			</button>

			<ul class="hidden lg:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-gray-400">
				{#if session}
					<li><a href="/dashboard" class="nav-link">Dashboard</a></li>
				{/if}
				{#each navLinks as link}
					<li><a href={link.href} class="nav-link">{link.label}</a></li>
				{/each}
			</ul>

			<div class="hidden lg:flex items-center gap-4">
				{#if loading}
					<div class="w-24 h-8 bg-white/5 rounded animate-pulse"></div>
				{:else if session}
					<button
						on:click={() => goto('/dashboard')}
						class="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest hover:text-white transition text-sm"
					>
						<i class="bi bi-person-circle text-lg"></i>
						<span>{userProfile?.full_name || 'Operator'}</span>
					</button>
					<button
						on:click={handleLogout}
						class="px-4 py-1.5 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition text-xs font-bold uppercase tracking-widest"
					>
						Logout
					</button>
				{:else}
					<button
						on:click={() => goto('/login')}
						class="px-5 py-2 border border-purple-500/50 text-purple-400 rounded hover:bg-purple-500/10 transition font-bold text-xs uppercase tracking-widest"
					>
						Login
					</button>
					<button
						on:click={() => goto('/signup')}
						class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded transition font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-900/20"
					>
						Sign Up
					</button>
				{/if}
			</div>

			<button
				class="lg:hidden p-2 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-900/20 transition active:scale-95"
				on:click={() => (navOpen = !navOpen)}
				aria-label="Toggle Menu"
			>
				<i class="bi {navOpen ? 'bi-x-lg' : 'bi-list'} text-xl"></i>
			</button>
		</div>
	</div>

	{#if navOpen}
		<div
			transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
			class="lg:hidden bg-[#151518] border-t border-white/10 shadow-2xl overflow-hidden"
		>
			<div class="px-6 py-6 flex flex-col gap-6">
				<ul class="flex flex-col gap-4 font-bold text-gray-400 uppercase tracking-widest text-sm">
					{#if session}
						<li>
							<a href="/dashboard" class="mobile-link text-cyan-400 border-cyan-500/50" on:click={closeMenu}>
								<i class="bi bi-grid-fill mr-2"></i> Dashboard
							</a>
						</li>
					{/if}
					{#each navLinks as link}
						<li>
							<a href={link.href} class="mobile-link" on:click={closeMenu}>{link.label}</a>
						</li>
					{/each}
				</ul>

				<div class="h-px w-full bg-white/5"></div>

				<div>
					{#if loading}
						<div class="w-full h-10 bg-white/5 rounded animate-pulse"></div>
					{:else if session}
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3 text-cyan-400 font-bold text-sm">
								<i class="bi bi-person-circle text-lg"></i>
								<span>{userProfile?.full_name || 'Operator'}</span>
							</div>
							<button
								on:click={handleLogout}
								class="w-full py-3 border border-red-500/40 text-red-400 rounded font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 transition"
							>
								Abort Session
							</button>
						</div>
					{:else}
						<div class="flex flex-col gap-3">
							<button
								on:click={() => { goto('/login'); closeMenu(); }}
								class="w-full py-3 border border-purple-500/50 text-purple-400 rounded font-bold uppercase tracking-widest text-xs hover:bg-purple-900/10 transition"
							>
								Login
							</button>
							<button
								on:click={() => { goto('/signup'); closeMenu(); }}
								class="w-full py-3 bg-linear-to-r from-cyan-600 to-cyan-500 text-black rounded font-bold uppercase tracking-widest text-xs shadow-lg"
							>
								Sign Up
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</nav>

