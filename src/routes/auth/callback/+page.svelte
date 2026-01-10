<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';

	onMount(() => {
		// 1. Get the destination (default to update-password)
		const next = $page.url.searchParams.get('next') ?? '/dashboard';

		// 2. Setup a listener. This fires immediately if the session is already active,
		//    or as soon as Supabase finishes processing the URL code/hash.
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			
			// If we have a session, the login succeeded!
			if (session) {
				// Special check: If this is a password recovery flow
				if (event === 'PASSWORD_RECOVERY') {
					console.log('Recovery event detected');
				}
				
				// Redirect to the update page
				goto(next);
			} 
			
			// Safety timeout: If nothing happens after 3 seconds (e.g. bad link), go to login
			// But ONLY if we don't have a session
			if (!session) {
				setTimeout(() => {
					// Check session one last time before giving up
					supabase.auth.getSession().then(({ data }) => {
						if (!data.session) {
							console.error("No session found after wait. Redirecting to login.");
							goto('/login?error=timeout');
						}
					});
				}, 4000);
			}
		});

		// Cleanup listener when leaving
		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white font-mono">
	<div class="flex flex-col items-center gap-4">
		<div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
		<p class="text-xs uppercase tracking-widest text-cyan-500">Authenticating...</p>
	</div>
</div>