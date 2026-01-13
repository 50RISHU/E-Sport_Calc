<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';

	onMount(() => {
		// --- SAFETY BRIDGE: Force App Open on Mobile ---
		// If the user lands on the website via a mobile device, throw them to the app.
		const userAgent = navigator.userAgent.toLowerCase();
		const isAndroid = userAgent.includes("android");
		// const isIOS = userAgent.includes("iphone") || userAgent.includes("ipad"); // Uncomment if needed

		if (isAndroid) {
			console.log("Mobile device on Web Callback. Attempting Deep Link...");
			
			// We grab the parameters Supabase sent (tokens are in the hash or query)
			const hash = window.location.hash;
			const query = window.location.search;
			
			// FORCE the browser to open your app
			// This string must match your scheme exactly
			window.location.href = `com.esportcalc.app://auth/callback${query}${hash}`;
			
			// We do NOT return here. We let the web logic below run as a backup 
			// just in case the user doesn't have the app installed.
		}
		// --------------------------------------------------

		const next = $page.url.searchParams.get('next') ?? '/dashboard';

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				if (event === 'PASSWORD_RECOVERY') {
					console.log('Recovery event detected');
				}
				goto(next);
			} 
			
			if (!session) {
				setTimeout(() => {
					supabase.auth.getSession().then(({ data }) => {
						if (!data.session) {
							goto('/login?error=timeout');
						}
					});
				}, 4000);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white font-mono">
	<div class="flex flex-col items-center gap-4">
		<div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
		<p class="text-xs uppercase tracking-widest text-cyan-500">Authenticating...</p>
		
		<p class="text-[10px] text-gray-500 mt-4">
			Stuck? <a href="com.esportcalc.app://auth/callback" class="underline hover:text-white">Open App</a>
		</p>
	</div>
</div>