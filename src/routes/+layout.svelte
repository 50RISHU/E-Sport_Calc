<script>
	import './layout.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import logo from '$lib/images/esport-logo.png';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	let navOpen = false;
</script>

<nav
	class="bg-[#0E0E10]/95 md:bg-[#0E0E10]/80 backdrop-blur-sm md:backdrop-blur-md shadow-xl border-b border-cyan-500/20 text-slate-200 sticky top-0 z-50 font-['Rajdhani'] transition-all duration-300 gpu-accelerated"
>
	<div class="container mx-auto px-4 py-3 flex items-center justify-between">
		<div class="flex items-center space-x-3 cursor-pointer group" on:click={() => goto('/dashboard')}>
			<div class="relative">
				<div class="hidden md:block absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
				<img
					src={logo}
					alt="ESports Calculator Logo"
					class="relative z-10 w-10 h-10 rounded-full border border-cyan-500/50 transform transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-cyan-900/50"
				/>
			</div>
			<span class="font-black text-white text-xl tracking-widest uppercase relative">
				Cyber<span class="text-cyan-500">Calc</span>
			</span>
		</div>

		<button
			class="lg:hidden p-2 border border-purple-500/50 text-purple-400 rounded-md hover:bg-purple-900/30 transition"
			on:click={() => (navOpen = !navOpen)}
		>
			<i class="bi bi-list text-2xl"></i>
		</button>

		<ul class="hidden lg:flex items-center space-x-8 font-semibold text-gray-400 text-sm uppercase tracking-widest">
			<li><a href="/dashboard" class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200 pb-1">Dashboard</a></li>
			<li><a href="/dashboard" class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200 pb-1">About</a></li>
			<li><a href="/dashboard" class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200 pb-1">Pricing</a></li>
			<li><a href="/dashboard" class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200 pb-1">Contact</a></li>
		</ul>

		<div class="hidden lg:flex space-x-3">
			<button on:click={() => goto('/login')} class="px-5 py-2 border border-purple-500 text-purple-400 rounded-md hover:bg-purple-900/30 transition font-bold text-sm uppercase tracking-widest relative overflow-hidden group">
				<span class="relative z-10">Login</span>
				<div class="absolute inset-0 bg-purple-500/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
			</button>
			<button on:click={() => goto('/signup')} class="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black rounded-md hover:from-cyan-500 hover:to-cyan-400 transition font-bold text-sm uppercase tracking-widest shadow-md shadow-cyan-900/50 hover:shadow-cyan-500/50 hover:scale-105 transform duration-200">
				Sign Up
			</button>
		</div>
	</div>

	<div class={`lg:hidden bg-[#151518] border-t border-white/10 overflow-hidden transition-all duration-300 ${navOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
		<ul class="flex flex-col space-y-3 px-6 font-semibold text-gray-400 uppercase tracking-widest">
			<li><a href="/dashboard" class="block py-2 hover:text-cyan-400">Dashboard</a></li>
			<li><a href="/dashboard" class="block py-2 hover:text-cyan-400">About</a></li>
			<li><a href="/dashboard" class="block py-2 hover:text-cyan-400">Pricing</a></li>
			<li><a href="/dashboard" class="block py-2 hover:text-cyan-400">Contact</a></li>
		</ul>
		<div class="mt-6 px-6 flex flex-col space-y-3 pt-4 border-t border-white/5">
			<button on:click={() => goto('/login')} class="w-full px-4 py-2 border border-purple-500 text-purple-400 rounded-md font-bold uppercase tracking-widest">Login</button>
			<button on:click={() => goto('/signup')} class="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black rounded-md font-bold uppercase tracking-widest">Sign Up</button>
		</div>
	</div>
</nav>

<main class="min-h-screen relative overflow-hidden bg-[#0a0a0c]">
	<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>

	<div 
		class="fixed inset-0 -z-45 opacity-5 bg-center bg-repeat pointer-events-none"
		style="background-image: url('https://www.transparenttextures.com/patterns/dark-mosaic.png');"
	></div>

	<div class="hidden md:block fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow gpu-accelerated"></div>
	<div class="hidden md:block fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow gpu-accelerated" style="animation-delay: 2s;"></div>
	
	<div class="hidden md:block fixed bottom-0 right-0 -translate-y-1/4 translate-x-1/4 text-white/[0.02] pointer-events-none -z-20 rotate-12 gpu-accelerated">
		<i class="bi bi-controller text-[600px]"></i>
	</div>

	<slot />
</main>

<footer class="bg-[#0E0E10] text-gray-400 pt-12 pb-6 border-t border-white/5 font-['Rajdhani'] relative overflow-hidden">
	<div class="container mx-auto px-4 relative z-10">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-10">
			<div>
				<h5 class="font-black text-cyan-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"><i class="bi bi-cpu"></i> CyberCalc // Core</h5>
				<p class="text-sm leading-relaxed text-gray-500">Real-time performance metrics and predictive analytics for elite esports.</p>
			</div>

			<div>
				<h5 class="font-black text-purple-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"><i class="bi bi-compass"></i> Access</h5>
				<ul class="space-y-3 text-sm font-medium">
					<li><a href="/" class="hover:text-cyan-400 transition">Home</a></li>
					<li><a href="/" class="hover:text-cyan-400 transition">Pricing</a></li>
					<li><a href="/" class="hover:text-cyan-400 transition">About</a></li>
				</ul>
			</div>

			<div>
				<h5 class="font-black text-cyan-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"><i class="bi bi-broadcast"></i> Contact</h5>
				<div class="space-y-3 text-sm font-medium">
					<div class="flex items-center gap-3">
						<i class="bi bi-envelope-fill text-purple-400"></i>
						<span>support@cybercalc.com</span>
					</div>
					<div class="flex items-center gap-3">
						<i class="bi bi-phone-fill text-purple-400"></i>
						<span>+91 98765 43210</span>
					</div>
				</div>
			</div>
		</div>

		<hr class="border-white/5 mt-10 mb-6" />
		<div class="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono">
			<div>© 2025 CyberCalc Systems</div>
		</div>
	</div>
</footer>

<style>
	.navlinks { text-decoration: none; padding: 5px; }
	
	/* Reduced animation load */
	@media (min-width: 768px) {
		@keyframes pulse-slow {
			0%, 100% { opacity: 0.2; transform: scale(1); }
			50% { opacity: 0.3; transform: scale(1.1); }
		}
		.animate-pulse-slow {
			animation: pulse-slow 8s ease-in-out infinite;
		}
	}
	
	/* Utility class for hardware acceleration */
	.gpu-accelerated {
		transform: translateZ(0);
		will-change: transform;
	}
</style>