<script lang="ts">
    import bg from '../images/bg.avif';
    import logo from '../images/esport-logo.png'
</script>

<div class="md:w-1/2 w-full h-64 md:h-auto relative overflow-hidden group">
    <img
        src={bg}
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        alt="Background"
    />
    
    <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-purple-900/40 mix-blend-multiply"></div>
    <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>

    <div
        class="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center"
    >
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-cyan-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
            <img src={logo} alt="ESPorts Calculator Logo" class="w-28 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>

        <h1 class="text-4xl md:text-5xl text-white font-black font-['Rajdhani'] uppercase tracking-wider drop-shadow-lg mb-2">
            Cyber<span class="text-cyan-500">Calc</span>
        </h1>

        <div class="h-1 w-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mb-4"></div>

        <p class="text-gray-300 text-sm md:text-base font-mono tracking-widest uppercase opacity-80">
            System by <span class="text-white font-bold">Ram Bhakt Esports</span>
        </p>
    </div>
</div>