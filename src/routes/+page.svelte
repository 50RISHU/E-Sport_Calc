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

<div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
<div 
    class="fixed inset-0 -z-45 opacity-10 bg-center bg-repeat pointer-events-none"
    style="background-image: url('https://www.transparenttextures.com/patterns/dark-mosaic.png');"
></div>
<div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow"></div>
<div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow"></div>
<div class="fixed inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-30 pointer-events-none"></div>


<div class="min-h-screen text-slate-200 flex flex-col font-['Inter'] selection:bg-cyan-500 selection:text-black relative overflow-hidden">

	<main class="flex-1 flex flex-col items-center justify-center text-center px-4 mt-8 mb-20 z-10">
		{#if visible}
			<div in:fly={{ y: 20, duration: 800, delay: 100 }} class="relative">
				<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/20 blur-[100px] w-64 h-64 rounded-full -z-10"></div>
				
				<img 
                    src={logo} 
                    alt="Esports Logo" 
                    class="w-40 h-40 md:w-56 md:h-56 object-contain mx-auto mb-8 animate-float drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]" 
                />
				
				<h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight font-['Rajdhani'] uppercase">
					Manage Protocols.<br />
					<span class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-300% animate-gradient">Calculate Victory.</span>
				</h1>
				
				<p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium font-mono">
					The ultimate tactical tool for elite organizers. Track eliminations, manage sectors, and automate scoring algorithms instantly.
				</p>

				<button 
					on:click={getStarted}
					class="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-black text-white transition-all duration-200 bg-linear-to-r from-cyan-600 to-cyan-500 rounded-lg hover:scale-105 shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] uppercase tracking-widest font-['Rajdhani']"
				>
					<span class="relative z-10 flex items-center gap-3">
                        Initialize System
                        <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </span>
				</button>
			</div>
		{/if}
	</main>

	<section class="border-t border-white/5 bg-black/40 backdrop-blur-sm py-20 relative z-10">
		<div class="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
			
			<div class="bg-[#0E0E10] p-8 rounded-2xl border border-white/5 hover:border-cyan-500/50 shadow-lg hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] transition-all group relative overflow-hidden">
				<div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i class="bi bi-trophy text-8xl"></i>
                </div>
                <div class="w-14 h-14 bg-purple-900/20 text-purple-400 border border-purple-500/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
					<i class="bi bi-trophy-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-3 font-['Rajdhani'] uppercase tracking-wide text-white group-hover:text-purple-400 transition-colors">Tournament Management</h3>
				<p class="text-gray-500 text-sm leading-relaxed">Create events with custom scoring rules. Full support for classic brackets or Round Robin sector assignments.</p>
			</div>

			<div class="bg-[#0E0E10] p-8 rounded-2xl border border-white/5 hover:border-cyan-500/50 shadow-lg hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] transition-all group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i class="bi bi-cpu text-8xl"></i>
                </div>
				<div class="w-14 h-14 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
					<i class="bi bi-calculator-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-3 font-['Rajdhani'] uppercase tracking-wide text-white group-hover:text-cyan-400 transition-colors">Auto-Point Calculation</h3>
				<p class="text-gray-500 text-sm leading-relaxed">Input kill data and rank position; the system handles the math. Define your own point matrix per elimination.</p>
			</div>

			<div class="bg-[#0E0E10] p-8 rounded-2xl border border-white/5 hover:border-red-500/50 shadow-lg hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)] transition-all group relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i class="bi bi-hdd-stack text-8xl"></i>
                </div>
				<div class="w-14 h-14 bg-red-900/20 text-red-400 border border-red-500/30 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
					<i class="bi bi-hdd-stack-fill"></i>
				</div>
				<h3 class="text-xl font-bold mb-3 font-['Rajdhani'] uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">Match Archives</h3>
				<p class="text-gray-500 text-sm leading-relaxed">Secure data persistence for multiple matches. Review history and edit results via the tactical dashboard.</p>
			</div>

		</div>
	</section>

	<footer
    class="bg-[#0E0E10] text-gray-400 pt-12 pb-6 border-t border-white/5 font-['Rajdhani'] relative overflow-hidden"
>
    <div class="container mx-auto px-4 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
                <h5
                    class="font-black text-cyan-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"
                >
                    <i class="bi bi-cpu"></i> EsportCalc // Core
                </h5>
                <p class="text-sm leading-relaxed text-gray-500">
                    Real-time performance metrics and predictive analytics for elite esports.
                </p>
            </div>

            <div>
                <h5
                    class="font-black text-purple-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"
                >
                    <i class="bi bi-compass"></i> Access
                </h5>
                <ul class="space-y-3 text-sm font-medium">
                    <li><a href="/" class="hover:text-cyan-400 transition">Home</a></li>
                    <li><a href="/" class="hover:text-cyan-400 transition">Store</a></li>
                    <li><a href="/" class="hover:text-cyan-400 transition">About</a></li>
                </ul>
            </div>

            <div>
                <h5
                    class="font-black text-cyan-500 mb-4 text-xl uppercase tracking-widest flex items-center gap-2"
                >
                    <i class="bi bi-broadcast"></i> Contact
                </h5>
                <div class="space-y-3 text-sm font-medium">
                    <div class="flex items-center gap-3">
                        <i class="bi bi-envelope-fill text-purple-400"></i>
                        <span>rbconnect.official@gmail.com</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <i class="bi bi-phone-fill text-purple-400"></i>
                        <span>+91 000 000 0000</span>
                    </div>
                </div>
            </div>
        </div>

        <hr class="border-white/5 mt-10 mb-6" />
        <div
            class="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono"
        >
            <div>© 2025 EsportCalc Systems</div>
        </div>
    </div>
</footer>
	
</div>

<style>
	@keyframes float {
		0% { transform: translateY(0px); }
		50% { transform: translateY(-15px); }
		100% { transform: translateY(0px); }
	}
	.animate-float {
		animation: float 4s ease-in-out infinite;
	}

    @keyframes pulse-slow {
		0%, 100% { opacity: 0.2; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(1.1); }
	}
	.animate-pulse-slow {
		animation: pulse-slow 8s ease-in-out infinite;
	}

    .bg-300\% {
        background-size: 300% 300%;
    }
    @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    .animate-gradient {
        animation: gradient 6s ease infinite;
    }
</style>	