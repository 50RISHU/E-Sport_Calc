<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/images/esport-logo.png';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let visible = false;

	onMount(() => {
		visible = true;
	});

	const getStarted = () => {
		goto('/dashboard');
	};
</script>

<div class="min-h-screen bg-[#DCD7C9] text-[#3D2C2E] flex flex-col font-sans selection:bg-[#A27B5C] selection:text-white">
	
	<nav class="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
		<div class="flex items-center gap-3">
			<img src={logo} alt="Logo" class="w-10 h-10 object-contain drop-shadow-md" />
			<span class="font-bold text-xl tracking-tight">ESPORTS CALC</span>
		</div>
		<button 
			on:click={getStarted}
			class="px-5 py-2 border-2 border-[#3D2C2E] rounded-full font-bold hover:bg-[#3D2C2E] hover:text-[#DCD7C9] transition-all"
		>
			Open Dashboard
		</button>
	</nav>

	<main class="flex-1 flex flex-col items-center justify-center text-center px-4 mt-8 mb-16">
		{#if visible}
			<div in:fly={{ y: 20, duration: 800, delay: 100 }} class="relative">
				<div class="absolute inset-0 bg-[#A27B5C] opacity-20 blur-3xl rounded-full scale-150 -z-10"></div>
				
				<img src={logo} alt="Esports Logo" class="w-40 h-40 md:w-52 md:h-52 object-contain mx-auto mb-6 animate-float" />
				
				<h1 class="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
					Manage Tournaments.<br />
					<span class="text-[#A27B5C]">Calculate Victory.</span>
				</h1>
				
				<p class="text-lg md:text-xl opacity-75 max-w-2xl mx-auto mb-10 font-medium">
					The ultimate tool for organizers. Track kills, manage groups, and automate point calculations instantly.
				</p>

				<button 
					on:click={getStarted}
					class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-[#A27B5C] rounded-xl hover:bg-[#8F6A50] hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A27B5C]"
				>
					Start Calculating
					<svg class="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
					</svg>
				</button>
			</div>
		{/if}
	</main>

	<section class="bg-white/50 backdrop-blur-sm py-16 border-t border-[#A27B5C]/20">
		<div class="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
			
			<div class="bg-[#F6E6C9] p-8 rounded-2xl border border-[#A27B5C]/20 shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-[#A27B5C] text-white rounded-lg flex items-center justify-center text-2xl mb-4">
					<i class="bi bi-trophy-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-2">Tournament Management</h3>
				<p class="opacity-70 text-sm">Create tournaments with custom scoring rules. Support for simple brackets or Round Robin groups.</p>
			</div>

			<div class="bg-[#F6E6C9] p-8 rounded-2xl border border-[#A27B5C]/20 shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-[#3D2C2E] text-white rounded-lg flex items-center justify-center text-2xl mb-4">
					<i class="bi bi-calculator-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-2">Auto-Point Calculation</h3>
				<p class="opacity-70 text-sm">Input kills and positions; we handle the math. define your own point system per kill and rank.</p>
			</div>

			<div class="bg-[#F6E6C9] p-8 rounded-2xl border border-[#A27B5C]/20 shadow-sm hover:shadow-md transition-shadow">
				<div class="w-12 h-12 bg-[#A27B5C] text-white rounded-lg flex items-center justify-center text-2xl mb-4">
					<i class="bi bi-hdd-stack-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-2">Match History</h3>
				<p class="opacity-70 text-sm">Save data for multiple matches (Match 1, Match 2...) and edit results anytime. Data persists locally.</p>
			</div>

		</div>
	</section>
    
</div>

<style>
	/* Simple float animation for the logo */
	@keyframes float {
		0% { transform: translateY(0px); }
		50% { transform: translateY(-15px); }
		100% { transform: translateY(0px); }
	}
	.animate-float {
		animation: float 4s ease-in-out infinite;
	}
</style>