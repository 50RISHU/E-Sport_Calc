<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let errorMsg = $state('');
    
	async function handleReset() {
		if (!email) return;
		loading = true;
		errorMsg = '';
		message = '';

		// FIX: Point to /auth/callback, and pass /update-password as the 'next' parameter
		const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: redirectTo
		});

		if (error) {
			errorMsg = error.message;
		} else {
			message = 'Check your email for the password reset link.';
		}
		loading = false;
	}
</script>

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div
	class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none"
></div>

<div class="min-h-screen flex items-center justify-center p-4 font-['Inter']">
	<div
		class="w-full max-w-md bg-[#0E0E10]/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden"
		in:fly={{ y: 20, duration: 500 }}
	>
		<div
			class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 to-purple-500"
		></div>

		<div class="text-center mb-8">
			<h1 class="text-3xl font-black text-white font-['Rajdhani'] uppercase tracking-wider">
				Reset <span class="text-cyan-500">Access</span>
			</h1>
			<p class="text-gray-500 text-sm mt-2">Enter your email to receive a recovery link.</p>
		</div>

		{#if message}
			<div
				class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold text-center mb-6"
			>
				<i class="bi bi-check-circle mr-2"></i>
				{message}
			</div>
			<button
				onclick={() => goto('/login')}
				class="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold uppercase tracking-widest rounded transition-all text-xs"
			>
				Return to Login
			</button>
		{:else}
			<div class="space-y-4">
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block"
						>Email Address</label
					>
					<div class="relative">
						<input
							type="email"
							bind:value={email}
							placeholder="OPERATOR@EXAMPLE.COM"
							class="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-gray-700 font-mono"
						/>
						<i class="bi bi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"></i>
					</div>
				</div>

				{#if errorMsg}
					<p class="text-red-500 text-xs font-bold text-center">{errorMsg}</p>
				{/if}

				<button
					onclick={handleReset}
					disabled={loading}
					class="w-full py-3 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50"
				>
					{loading ? 'Sending...' : 'Send Recovery Link'}
				</button>

				<div class="text-center mt-4">
					<a
						href="/login"
						class="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
					>
						<i class="bi bi-arrow-left mr-1"></i> Back to Login
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
