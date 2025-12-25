<script lang="ts">
    import './layout.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import logo from '$lib/images/esport-logo.png';
    import 'bootstrap-icons/font/bootstrap-icons.css';

    // Import Supabase
    import { supabase } from '$lib/supabaseClient';
    import type { Session } from '@supabase/supabase-js';

    let navOpen = false;
    let session: Session | null = null;
    let userProfile: any = null;
    let loading = true;

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

        if (!error && data) userProfile = data;
    };

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;
            if (session) fetchProfile(session.user.id);
            loading = false;
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_e, _s) => {
            session = _s;
            if (_s) fetchProfile(_s.user.id);
            else userProfile = null;
            loading = false;
        });

        return () => subscription.unsubscribe();
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        userProfile = null;
        navOpen = false;
        goto('/login');
    };
    
    // Helper to close menu
    const closeMenu = () => (navOpen = false);
</script>

<nav
    class="relative bg-[#0E0E10]/95 md:bg-[#0E0E10]/80 backdrop-blur-sm md:backdrop-blur-md shadow-xl border-b border-cyan-500/20 text-slate-200 sticky top-0 z-50 font-['Rajdhani'] gpu-accelerated"
>
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div
            class="flex items-center space-x-3 cursor-pointer group"
            on:click={() => { goto(session ? '/dashboard' : '/'); closeMenu(); }}
        >
            <div class="relative">
                <div
                    class="hidden md:block absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
                <img
                    src={logo}
                    alt="Logo"
                    class="relative z-10 w-10 h-10 rounded-full border border-cyan-500/50 transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-cyan-900/50"
                />
            </div>
            <span class="font-black text-white text-xl tracking-widest uppercase">
                Esport<span class="text-cyan-500">Calc</span>
            </span>
        </div>

        <button
            class="lg:hidden p-2 border border-purple-500/50 text-purple-400 rounded-md hover:bg-purple-900/30 transition active:scale-95"
            on:click={() => (navOpen = !navOpen)}
        >
            <i class="bi {navOpen ? 'bi-x-lg' : 'bi-list'} text-2xl transition-all duration-200"></i>
        </button>

        <ul class="hidden lg:flex items-center space-x-8 font-semibold text-gray-400 text-sm uppercase tracking-widest">
            {#if session}
                <li><a href="/dashboard" class="navlinks hover:text-cyan-400 transition-colors">Dashboard</a></li>
            {/if}
            <li><a href="/" class="navlinks hover:text-cyan-400 transition-colors">About</a></li>
            <li><a href="/" class="navlinks hover:text-cyan-400 transition-colors">Pricing</a></li>
        </ul>

        <div class="hidden lg:flex space-x-3 items-center">
            {#if loading}
                <div class="w-24 h-8 bg-white/5 rounded animate-pulse"></div>
            {:else if session}
                <div class="flex items-center gap-4">
                    <button
                        on:click={() => goto('/dashboard')}
                        class="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest hover:text-white transition"
                    >
                        <i class="bi bi-person-circle text-lg"></i>
                        <span>{userProfile?.full_name || 'Operator'}</span>
                    </button>
                    <button
                        on:click={handleLogout}
                        class="px-4 py-1.5 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition text-xs font-bold uppercase tracking-widest"
                    >
                        Logout
                    </button>
                </div>
            {:else}
                <button
                    on:click={() => goto('/login')}
                    class="px-5 py-2 border border-purple-500 text-purple-400 rounded-md hover:bg-purple-900/30 transition font-bold text-sm uppercase tracking-widest relative overflow-hidden group"
                >
                    <span class="relative z-10">Login</span>
                    <div class="absolute inset-0 bg-purple-500/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
                <button
                    on:click={() => goto('/signup')}
                    class="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black rounded-md hover:from-cyan-500 hover:to-cyan-400 transition font-bold text-sm uppercase tracking-widest shadow-md shadow-cyan-900/50 hover:shadow-cyan-500/50 hover:scale-105 transform duration-200"
                >
                    Sign Up
                </button>
            {/if}
        </div>
    </div>

    <div
        class={`lg:hidden absolute left-0 right-0 top-full bg-[#151518] border-t border-white/10 transform-gpu will-change-transform origin-top transition-all duration-300 ease-out shadow-2xl ${
            navOpen
                ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto'
                : 'opacity-0 -translate-y-2 scale-y-95 pointer-events-none'
        }`}
    >
        <div class="py-6 px-6 flex flex-col gap-6">
            <ul class="flex flex-col space-y-4 font-semibold text-gray-400 uppercase tracking-widest">
                {#if session}
                    <li>
                        <a 
                            href="/dashboard" 
                            class="block py-2 hover:text-cyan-400 border-l-2 border-transparent hover:border-cyan-500 pl-2 transition-all" 
                            on:click={closeMenu}
                        >
                            Dashboard
                        </a>
                    </li>
                {/if}
                <li>
                    <a href="/" class="block py-2 hover:text-cyan-400 border-l-2 border-transparent hover:border-cyan-500 pl-2 transition-all" on:click={closeMenu}>About</a>
                </li>
                <li>
                    <a href="/" class="block py-2 hover:text-cyan-400 border-l-2 border-transparent hover:border-cyan-500 pl-2 transition-all" on:click={closeMenu}>Pricing</a>
                </li>
            </ul>

            <hr class="border-white/5">

            <div>
                {#if loading}
                    <div class="w-full h-10 bg-white/5 rounded animate-pulse"></div>
                {:else if session}
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-3 text-cyan-400 font-bold">
                            <i class="bi bi-person-circle"></i>
                            <span>Logged in as {userProfile?.full_name || 'Operator'}</span>
                        </div>
                        <button
                            on:click={handleLogout}
                            class="w-full px-4 py-3 border border-red-500/50 text-red-400 rounded-md font-bold uppercase tracking-widest hover:bg-red-500/10 transition"
                        >
                            Abort Session (Logout)
                        </button>
                    </div>
                {:else}
                    <div class="flex flex-col space-y-3">
                        <button
                            on:click={() => { goto('/login'); closeMenu(); }}
                            class="w-full px-4 py-3 border border-purple-500 text-purple-400 rounded-md font-bold uppercase tracking-widest hover:bg-purple-900/10 transition"
                        >
                            Login
                        </button>
                        <button
                            on:click={() => { goto('/signup'); closeMenu(); }}
                            class="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-black rounded-md font-bold uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-cyan-900/20"
                        >
                            Sign Up
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</nav>

<main class="min-h-screen relative overflow-hidden bg-[#0a0a0c]">
    <div class="fixed inset-0 bg-[#0a0a0c] -z-50"></div>
    <div
        class="fixed inset-0 -z-45 opacity-5 bg-center bg-repeat pointer-events-none"
        style="background-image: url('https://www.transparenttextures.com/patterns/dark-mosaic.png');"
    ></div>

    <div
        class="hidden md:block fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow gpu-accelerated"
    ></div>
    <div
        class="hidden md:block fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] -z-40 pointer-events-none animate-pulse-slow gpu-accelerated"
        style="animation-delay: 2s;"
    ></div>
    <div
        class="hidden md:block fixed bottom-0 right-0 -translate-y-1/4 translate-x-1/4 text-white/[0.02] pointer-events-none -z-20 rotate-12 gpu-accelerated"
    >
        <i class="bi bi-controller text-[600px]"></i>
    </div>

    <slot />
</main>

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
                    <li><a href="/" class="hover:text-cyan-400 transition">Pricing</a></li>
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
                        <span>+91 98765 43210</span>
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

<style>
    .navlinks {
        text-decoration: none;
        padding: 5px;
    }
    .gpu-accelerated {
        transform: translateZ(0);
        will-change: transform;
    }
</style>