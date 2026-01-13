<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let errorMsg = $state('');

	// Protect this route: User must be "logged in" (via recovery link) to see this
	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		// If no session exists, they shouldn't be here. Send them to login.
		if (!session) {
			goto('/login');
		}
	});

	async function handleUpdatePassword() {
		if (password !== confirmPassword) {
			errorMsg = "Passwords do not match.";
			return;
		}
		if (password.length < 6) {
			errorMsg = "Password must be at least 6 characters.";
			return;
		}

		loading = true;
		errorMsg = '';

		// Update the user's password using the active session (from the email link)
		const { error } = await supabase.auth.updateUser({ password: password });

		if (error) {
			errorMsg = error.message;
			loading = false;
		} else {
            // Success!
			alert("Password updated successfully!");
            // Redirect to dashboard (user is already logged in)
			goto('/dashboard');
		}
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div class="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"></div>

<div class="min-h-screen flex items-center justify-center p-4 font-['Inter']">
	<div 
		class="w-full max-w-md bg-[#0E0E10]/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden"
		in:fly={{ y: 20, duration: 500 }}
	>
		<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-cyan-500"></div>

		<div class="text-center mb-8">
			<h1 class="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
				New <span class="text-purple-500">Credentials</span>
			</h1>
			<p class="text-gray-500 text-sm mt-2">Secure your account with a new password.</p>
		</div>

		<div class="space-y-4">
			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">New Password</label>
				<div class="relative">
					<input 
						type="password" 
						bind:value={password}
						placeholder="••••••••" 
						class="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-700 font-mono"
					/>
					<i class="bi bi-key absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"></i>
				</div>
			</div>

			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Confirm Password</label>
				<div class="relative">
					<input 
						type="password" 
						bind:value={confirmPassword}
						placeholder="••••••••" 
						class="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-700 font-mono"
					/>
					<i class="bi bi-shield-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"></i>
				</div>
			</div>

			{#if errorMsg}
				<p class="text-red-500 text-xs font-bold text-center">{errorMsg}</p>
			{/if}

			<button 
				onclick={handleUpdatePassword}
				disabled={loading}
				class="w-full py-3 bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
			>
				{loading ? 'Updating...' : 'Update Password'}
			</button>
		</div>
	</div>
</div>