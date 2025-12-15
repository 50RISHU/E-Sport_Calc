<script>
	import './layout.css';
	// Import Bootstrap CSS if still needed, but relying primarily on Tailwind for the new theme
	// Note: Removed 'bootstrap/dist/css/bootstrap.min.css' to avoid style conflicts if you're now using Tailwind exclusively for colors/layout
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import logo from '$lib/images/esport-logo.png';
	// Importing Bootstrap JS for any required functionality (e.g., dropdowns)
	import 'bootstrap-icons/font/bootstrap-icons.css'; // Ensure Bootstrap Icons are imported

	let navOpen = false;

	onMount(async () => {
		// Ensure Bootstrap JS is loaded if you rely on any of its behaviors
		// await import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
</script>

<nav
	class="bg-[#0E0E10] shadow-xl border-b border-cyan-500/20 text-slate-200 sticky top-0 z-50 font-['Rajdhani']"
>
	<div class="container mx-auto px-4 py-3 flex items-center justify-between">
		<div class="flex items-center space-x-3 cursor-pointer" on:click={() => goto('/dashboard')}>
			<img
				src={logo}
				alt="ESports Calculator Logo"
				class="w-10 h-10 rounded-full border border-cyan-500/50 transform transition-transform duration-300 hover:scale-110 shadow-lg shadow-cyan-900/50"
			/>
			<span class="font-black text-white text-xl tracking-widest uppercase">
				Cyber<span class="text-cyan-500">Calc</span>
			</span>
		</div>

		<button
			class="lg:hidden p-2 border border-purple-500/50 text-purple-400 rounded-md hover:bg-purple-900/30 transition"
			on:click={() => (navOpen = !navOpen)}
		>
			<i class="bi bi-list text-2xl"></i>
		</button>

		<ul
			class="hidden lg:flex items-center space-x-8 font-semibold text-gray-400 text-sm uppercase tracking-widest"
		>
			<li>
				<a
					href="/dashboard"
					class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200"
					>Dashboard</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200"
					>About</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200"
					>Pricing</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="navlinks hover:text-cyan-400 border-b-2 border-transparent hover:border-cyan-500 transition-colors duration-200"
					>Contact</a
				>
			</li>
		</ul>

		<div class="hidden lg:flex space-x-3">
			<button
				on:click={() => goto('/login')}
				class="px-5 py-2 border border-purple-500 text-purple-400 rounded-md hover:bg-purple-900/30 transition font-bold text-sm uppercase tracking-widest"
			>
				Login
			</button>
			<button
				on:click={() => goto('/signup')}
				class="px-5 py-2 bg-cyan-600 text-black rounded-md hover:bg-cyan-500 transition font-bold text-sm uppercase tracking-widest shadow-md shadow-cyan-900/50"
			>
				Sign Up
			</button>
		</div>
	</div>

	<div
		class={`lg:hidden bg-[#151518] border-t border-white/10 overflow-hidden transition-all duration-300 ${
			navOpen ? 'max-h-96 py-4' : 'max-h-0'
		}`}
	>
		<ul class="flex flex-col space-y-3 px-6 font-semibold text-gray-400 uppercase tracking-widest">
			<li>
				<a href="/dashboard" class="block py-2 hover:text-cyan-400 transition">Dashboard</a>
			</li>
			<li>
				<a href="/dashboard" class="block py-2 hover:text-cyan-400 transition">About</a>
			</li>
			<li>
				<a href="/dashboard" class="block py-2 hover:text-cyan-400 transition">Pricing</a>
			</li>
			<li>
				<a href="/dashboard" class="block py-2 hover:text-cyan-400 transition">Contact</a>
			</li>
		</ul>

		<div class="mt-6 px-6 flex flex-col space-y-3 pt-4 border-t border-white/5">
			<button
				on:click={() => goto('/login')}
				class="w-full px-4 py-2 border border-purple-500 text-purple-400 rounded-md hover:bg-purple-900/30 transition font-bold uppercase tracking-widest"
			>
				Login
			</button>
			<button
				on:click={() => goto('/signup')}
				class="w-full px-4 py-2 bg-cyan-600 text-black rounded-md hover:bg-cyan-500 transition font-bold uppercase tracking-widest"
			>
				Sign Up
			</button>
		</div>
	</div>
</nav>

<main class="min-h-screen">
	<slot />
</main>

<footer class="bg-[#0E0E10] text-gray-400 pt-8 pb-4 border-t border-white/5 font-['Rajdhani']">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div>
				<h5 class="font-black text-cyan-500 mb-4 text-lg uppercase tracking-widest">
					CyberCalc // Core
				</h5>
				<p class="text-sm">
					CyberCalc provides real-time performance metrics and predictive analytics for elite
					esports management and strategic deployment.
				</p>
			</div>

			<div>
				<h5 class="font-black text-purple-500 mb-4 text-lg uppercase tracking-widest">
					Navigation Access
				</h5>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="/" class="hover:text-cyan-400 transition">Initiate Session (Home)</a>
					</li>
					<li>
						<a href="/" class="hover:text-cyan-400 transition">Pricing Protocol</a>
					</li>
					<li>
						<a href="/" class="hover:text-cyan-400 transition">System Architecture (About)</a>
					</li>
					<li>
						<a href="/" class="hover:text-cyan-400 transition">Secure Comms</a>
					</li>
				</ul>
			</div>

			<div>
				<h5 class="font-black text-cyan-500 mb-4 text-lg uppercase tracking-widest">
					Contact Terminal
				</h5>
				<p class="mb-2 text-sm">
					<i class="bi bi-envelope-fill me-2 text-purple-400"></i>support@cybercalc.com
				</p>
				<p class="mb-2 text-sm">
					<i class="bi bi-phone-fill me-2 text-purple-400"></i>+91 98765 43210
				</p>
				<p class="text-sm">
					<i class="bi bi-geo-alt-fill me-2 text-purple-400"></i>Digital Hub, Sector 7, Mumbai
				</p>
			</div>
		</div>

		<hr class="border-white/5 mt-6 mb-3" />
		<div class="text-center text-xs text-gray-600 font-mono">
			<i class="bi bi-code-slash text-purple-400"></i> © 2025 CyberCalc Systems // All Rights Reserved
		</div>
	</div>
</footer>

<style>
	.navlinks {
		text-decoration: none;
		padding: 5px;
	}
</style>
