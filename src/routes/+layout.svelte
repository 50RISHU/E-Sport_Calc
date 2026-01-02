<script lang="ts">
	import './layout.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
	import Navbar from '$lib/components/Navbar.svelte';
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