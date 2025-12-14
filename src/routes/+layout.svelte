<script>
	import './layout.css';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import logo from '$lib/images/esport-logo.png';

	let navOpen = false;

	onMount(async () => {
		await import('bootstrap/dist/js/bootstrap.bundle.min.js');
	});
</script>

<!-- NAVBAR -->
<nav class="bg-[#0f2025] shadow-lg border-b border-[#A27B5C]/50">
	<div class="container mx-auto px-4 py-3 flex items-center justify-between">
		<!-- LOGO -->
		<div class="flex items-center space-x-3 cursor-pointer">
			<img
				src={logo}
				alt="ESports Calculator Logo"
				class="w-12 h-12 transform transition-transform duration-300 hover:scale-110"
			/>
			<span class="font-bold text-[#DCD7C9] text-xl tracking-wide">Esport Calculator</span>
		</div>

		<!-- MOBILE TOGGLER -->
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button
			class="lg:hidden p-2 border border-[#A27B5C] text-[#DCD7C9] rounded-md hover:bg-[#A27B5C] hover:text-black transition"
			on:click={() => (navOpen = !navOpen)}
		>
			<i class="bi bi-list text-2xl"></i>
		</button>

		<!-- DESKTOP LINKS -->
		<ul class="hidden lg:flex items-center space-x-8 font-semibold text-[#DCD7C9]">
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Dashboard</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>About</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Pricing</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Contact</a
				>
			</li>
		</ul>

		<!-- DESKTOP AUTH BUTTONS -->
		<div class="hidden lg:flex space-x-3">
			<button
				on:click={() => goto('/login')}
				class="px-4 py-2 border border-[#A27B5C] text-[#DCD7C9] rounded-md hover:bg-[#A27B5C] hover:text-black transition"
			>
				Login
			</button>
			<button
				on:click={() => goto('/signup')}
				class="px-4 py-2 bg-[#A27B5C] text-black rounded-md hover:bg-[#DCD7C9] transition"
			>
				Sign Up
			</button>
		</div>
	</div>

	<!-- MOBILE MENU -->
	<div
		class={`lg:hidden bg-[#3F4E50] border-t border-[#A27B5C]/40 overflow-hidden transition-all duration-300 ${
			navOpen ? 'max-h-96 py-4' : 'max-h-0'
		}`}
	>
		<ul class="flex flex-col space-y-4 px-6 font-semibold text-[#DCD7C9]">
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Dashboard</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>About</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Pricing</a
				>
			</li>
			<li>
				<a
					href="/dashboard"
					class="text-light navlinks"
					>Contact</a
				>
			</li>
		</ul>

		<div class="mt-4 px-6 flex flex-col space-y-3">
			<button
				on:click={() => goto('/login')}
				class="w-full px-4 py-2 border border-[#A27B5C] text-[#DCD7C9] rounded-md hover:bg-[#A27B5C] hover:text-black transition"
			>
				Login
			</button>
			<button
				on:click={() => goto('/signup')}
				class="w-full px-4 py-2 bg-[#A27B5C] text-black rounded-md hover:bg-[#DCD7C9] transition"
			>
				Sign Up
			</button>
		</div>
	</div>
</nav>

<!-- MAIN -->
<main class="min-h-screen bg-[#DCD7C9]/20">
	<slot />
</main>

<!-- FOOTER -->
<footer class="bg-[#0f2025] text-[#DCD7C9] pt-5 pb-3">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- About -->
			<div>
				<h5 class="fw-bold text-[#A27B5C] mb-3">Esport Calculator</h5>
				<p>
					Esport Calculator helps players, teams, and analysts track performance and improve
					gameplay.
				</p>
			</div>

			<!-- Quick Links -->
			<div>
				<h5 class="fw-bold text-[#A27B5C] mb-3">Quick Links</h5>
				<ul class="space-y-2">
					<li>
						<a
							href="/"
							class="text-light navlinks"
							>Home</a
						>
					</li>
					<li>
						<a
							href="/"
							class="text-light navlinks"
							>Pricing</a
						>
					</li>
					<li>
						<a
							href="/"
							class="text-light navlinks"
							>About</a
						>
					</li>
					<li>
						<a
							href="/"
							class="text-light navlinks"
							>Contact</a
						>
					</li>
				</ul>
			</div>

			<!-- Contact -->
			<div>
				<h5 class="fw-bold text-[#A27B5C] mb-3">Contact</h5>
				<p class="mb-1"><i class="bi bi-envelope-fill me-2"></i>support@esportcalc.com</p>
				<p class="mb-1"><i class="bi bi-phone-fill me-2"></i>+91 98765 43210</p>
				<p><i class="bi bi-geo-alt-fill me-2"></i>Mumbai, India</p>
			</div>
		</div>

		<hr class="border-[#3F4E50] mt-4" />
		<div class="text-center mt-2">© 2025 Esport Calculator · All Rights Reserved</div>
	</div>
</footer>


<style>
  .navlinks{
    text-decoration: none;
    padding: 5px;
  }
  :hover.navlinks{
    background: #A27B5C;
  }
</style>