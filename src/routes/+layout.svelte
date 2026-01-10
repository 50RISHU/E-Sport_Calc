<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { App } from '@capacitor/app';
	import { Capacitor } from '@capacitor/core';
	import './layout.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import Navbar from '$lib/components/Navbar.svelte';

	onMount(() => {
		// ONLY run this logic on the mobile app (Android/iOS)
		if (Capacitor.isNativePlatform()) {
			
			// Listen for the app opening from a URL (Deep Link)
			App.addListener('appUrlOpen', async (data) => {
				console.log('App opened with URL:', data.url);

				// 1. Check if the URL is our auth callback
				if (data.url.includes('auth/callback')) {
					
					// 2. Parse the URL manually to extract tokens
					// Supabase sends tokens in the hash part (#access_token=...)
					const urlStr = data.url;
					
					// Helper function to extract parameters
					const getParam = (str: string, key: string) => {
						const regex = new RegExp(`[#&?]${key}=([^&]*)`);
						const match = str.match(regex);
						return match ? decodeURIComponent(match[1]) : null;
					};

					const accessToken = getParam(urlStr, 'access_token');
					const refreshToken = getParam(urlStr, 'refresh_token');

					console.log('Tokens found:', accessToken ? 'Yes' : 'No');

					if (accessToken && refreshToken) {
						// 3. Manually set the Supabase session
						const { error } = await supabase.auth.setSession({
							access_token: accessToken,
							refresh_token: refreshToken
						});

						if (error) {
							console.error('Failed to set session:', error);
							alert('Session Error: ' + error.message);
						} else {
							console.log('Session set successfully! Navigating to dashboard...');
							goto('/dashboard');
						}
					} else {
						// Fallback: Sometimes the client picks it up automatically
						const { data: { session } } = await supabase.auth.getSession();
						if (session) {
							goto('/dashboard');
						} else {
							console.error('No tokens found in URL');
						}
					}
				}
			});
		}
	});
</script>

<Navbar />

<main class="min-h-screen relative overflow-hidden">
	<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
	
	<div
		class="fixed inset-0 -z-40 opacity-[0.03] bg-repeat pointer-events-none"
		style="background-image: url('https://www.transparenttextures.com/patterns/dark-mosaic.png');"
	></div>

	<div
		class="hidden md:block fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl -z-30 pointer-events-none animate-pulse-slow"
	></div>
	<div
		class="hidden md:block fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-3xl -z-30 pointer-events-none animate-pulse-slow"
		style="animation-delay: 2s;"
	></div>

	<div
		class="hidden md:block fixed bottom-0 right-0 -translate-y-1/4 translate-x-1/4 text-white/2 pointer-events-none -z-20 rotate-12"
	>
		<i class="bi bi-controller text-[600px]"></i>
	</div>

	<slot />
</main>

<style>
	/* Global Utility for smoothness */
	:global(html) {
		scroll-behavior: smooth;
	}
	
	/* GPU Acceleration Class */
	:global(.gpu-accelerated) {
		transform: translateZ(0);
		will-change: transform;
	}
</style>