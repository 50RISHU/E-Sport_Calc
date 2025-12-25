<script lang="ts">
	import LeftSideCard from '$lib/components/loginAndSignupLeftCard.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let loading = false;

	// 1. Email Login
	const handleLogin = async (e: Event) => {
		e.preventDefault();
		loading = true;

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		loading = false;

		if (error) {
			alert('Login Failed: ' + error.message);
		} else {
			goto('/dashboard');
		}
	};

	// 2. Google OAuth Login
	const handleGoogleLogin = async () => {
		loading = true;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/dashboard` // Ensure this route exists!
			}
		});

		if (error) {
			alert('Google Login Failed: ' + error.message);
			loading = false;
		}
	};

	const handleDiscordLogin = async () => {
		loading = true;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: `${window.location.origin}/dashboard`
			}
		});

		if (error) {
			alert('Discord Signup Failed: ' + error.message);
			loading = false;
		}
	};
</script>

<div
	class="min-h-screen flex flex-col md:flex-row bg-[#0a0a0c] text-slate-200 font-['Inter'] selection:bg-cyan-500 selection:text-black"
>
	<LeftSideCard />

	<div class="md:w-1/2 w-full flex justify-center items-center p-8 relative overflow-hidden">
		<div
			class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"
		></div>
		<div
			class="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"
		></div>

		<div class="w-full max-w-sm relative z-10">
			<div class="mb-8">
				<h2
					class="text-3xl md:text-4xl font-black text-white font-['Rajdhani'] uppercase tracking-wide mb-2"
				>
					Identity <span class="text-cyan-500">Verify</span>
				</h2>
				<p class="text-gray-500 text-sm font-mono uppercase tracking-widest">
					Enter credentials to access terminal
				</p>
			</div>

			<div class="space-y-6">
				<button
					on:click={handleGoogleLogin}
					disabled={loading}
					class="w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-black font-bold font-['Rajdhani'] text-lg tracking-wider uppercase shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="animate-pulse">Connecting...</span>
					{:else}
						<i class="bi bi-google text-xl"></i>
						<span>Access via Google</span>
					{/if}
				</button>

                <button
					on:click={handleDiscordLogin}
					disabled={loading}
					class="w-full py-3 rounded-lg bg-white hover:bg-gray-100 text-black font-bold font-['Rajdhani'] text-lg tracking-wider uppercase shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="animate-pulse">Connecting...</span>
					{:else}
						<i class="bi bi-discord text-xl"></i>
						<span>Access via Discord</span>
					{/if}             
				</button>

				<div class="relative flex py-2 items-center">
					<div class="flex-grow border-t border-white/10"></div>
					<span class="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase tracking-widest font-mono"
						>Or Standard Protocol</span
					>
					<div class="flex-grow border-t border-white/10"></div>
				</div>

				<form on:submit={handleLogin} class="space-y-6">
					<div class="space-y-2 group">
						<label
							class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-cyan-500 transition-colors"
							for="email"
						>
							Email Access ID
						</label>
						<div class="relative">
							<input
								type="email"
								id="email"
								bind:value={email}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm"
								placeholder="OPERATOR@SYSTEM.COM"
								required
							/>
							<i
								class="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors"
							></i>
						</div>
					</div>

					<div class="space-y-2 group">
						<label
							class="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono group-focus-within:text-purple-500 transition-colors"
							for="password"
						>
							Security Key
						</label>
						<div class="relative">
							<input
								type="password"
								id="password"
								bind:value={password}
								class="w-full p-4 pl-12 rounded-lg bg-[#151518] border border-white/10 text-white placeholder-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
								placeholder="••••••••"
								required
							/>
							<i
								class="bi bi-shield-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors"
							></i>
						</div>
					</div>

					<button
						disabled={loading}
						class="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-black font-['Rajdhani'] text-lg tracking-[0.2em] uppercase shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Authenticating...' : 'Initialize Session'}
					</button>
				</form>
			</div>

			<div class="text-center pt-4 border-t border-white/5 mt-6">
				<p class="text-sm text-gray-500">
					New Operator? <a
						href="/signup"
						class="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors uppercase tracking-wider text-xs"
						>Register Profile</a
					>
				</p>
			</div>
		</div>
	</div>
</div>
