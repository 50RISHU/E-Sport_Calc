<script lang="ts">
	import LeftSideCard from '$lib/components/loginAndSignupLeftCard.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Capacitor } from '@capacitor/core';

	let email = '';
	let password = '';
	let phone = '';
	let name = '';
	let loading = false;

	// 1. Standard Email Signup
	const handleSignup = async (e: Event) => {
		e.preventDefault();
		loading = true;

		// Optional: Check if email exists before trying to sign up
		// Note: RLS policies might block this select if not configured to allow anon read
		const { data: existingUser } = await supabase.from('profiles').select('email').eq('email', email);
		
		if (existingUser && existingUser.length > 0) {
			alert("Email already registered.");
			loading = false;
			return;
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { 
					phone: phone,
					full_name: name 
				}
			}
		});

		loading = false;

		if (error) {
			alert("Registration Failed: " + error.message);
		} else {
			alert("Registration Successful! Please check your email to confirm your account.");
			goto('/login');
		}
	};

	// 2. Google OAuth Signup
	const handleGoogleSignup = async () => {
		loading = true;

		// SMART REDIRECT: Detects if running as App or Web
		const redirectUrl = Capacitor.isNativePlatform()
			? 'com.esportcalc.app://auth/callback'
			: `${window.location.origin}/auth/callback`;

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: redirectUrl,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				}
			}
		});
		
		if (error) {
			alert("Google Signup Failed: " + error.message);
			loading = false;
		}
		// Note: loading stays true while redirecting
	};

	onMount(() => {
		// Safety check: If already logged in, go to dashboard
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				goto('/dashboard');
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<div class="min-h-screen flex flex-col md:flex-row bg-[#0a0a0c] text-slate-200 font-['Inter'] selection:bg-cyan-500 selection:text-black">
	
	<LeftSideCard />

	<div class="md:w-1/2 w-full flex justify-center items-center p-8 relative overflow-hidden">
		
		<div class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
		<div class="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

		<div class="w-full max-w-sm relative z-10">
			<div class="mb-8">
				<h2 class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-wide mb-2">
					New <span class="text-cyan-500">Operator</span>
				</h2>
				<p class="text-gray-500 text-sm font-mono uppercase tracking-widest">Create profile to access tactical data</p>
			</div>

			<div class="space-y-6">
				
				<button
					on:click={handleGoogleSignup}
					disabled={loading}
					class="w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-black font-bold font-['Rajdhani'] text-lg tracking-wider uppercase shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
						<span>Connecting...</span>
					{:else}
						<i class="bi bi-google text-xl"></i>
						<span>Register with Google</span>
					{/if}
				</button>

				<div class="relative flex py-2 items-center">
					<div class="grow border-t border-white/10"></div>
					<span class="shrink-0 mx-4 text-gray-600 text-xs uppercase tracking-widest font-mono">Or Manual Entry</span>
					<div class="grow border-t border-white/10"></div>
				</div>

				<form on:submit={handleSignup} class="space-y-5">
					
					<div class="space-y-2 group">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-cyan-500 transition-colors" for="email">
							Email Address
						</label>
						<div class="relative">
							<input
								type="email"
								id="email"
								bind:value={email}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm"
								placeholder="OPERATOR@SYSTEM.COM"
								required
								disabled={loading}
							/>
							<i class="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors"></i>
						</div>
					</div>

					<div class="space-y-2 group">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-purple-500 transition-colors" for="phone">
							Comms Link (Phone)
						</label>
						<div class="relative">
							<input
								type="tel"
								id="phone"
								bind:value={phone}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
								placeholder="1234567890"
								required
								disabled={loading}
							/>
							<i class="bi bi-telephone absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors"></i>
						</div>
					</div>

					<div class="space-y-2 group">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-green-500 transition-colors" for="name">
							Operator Name
						</label>
						<div class="relative">
							<input
								type="text"
								id="name"
								bind:value={name}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono text-sm"
								placeholder="Dragon Ball"
								required
								disabled={loading}
							/>
							<i class="bi bi-person-check absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors"></i>
						</div>
					</div>

					<div class="space-y-2 group">
						<label class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-red-500 transition-colors" for="password">
							Security Clearance (Password)
						</label>
						<div class="relative">
							<input
								type="password"
								id="password"
								bind:value={password}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-mono text-sm"
								placeholder="••••••••"
								required
								disabled={loading}
							/>
							<i class="bi bi-shield-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors"></i>
						</div>
					</div>

					<button
						disabled={loading}
						class="w-full py-4 rounded-lg bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-black font-['Rajdhani'] text-lg tracking-[0.2em] uppercase shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if loading}
							<div class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
							<span>Processing...</span>
						{:else}
							<span>Establish Uplink</span>
						{/if}
					</button>

					<div class="text-center pt-4 border-t border-white/5 mt-6">
						<p class="text-sm text-gray-500">
							Already Registered? <a href="/login" class="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors uppercase tracking-wider text-xs ml-1">Access Terminal</a>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>