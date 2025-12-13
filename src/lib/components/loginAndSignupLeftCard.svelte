	<script lang="ts">
        import bg from '../images/bg.avif';
        import logo from '../images/esport-logo.png'
    </script>
    
    <div class="md:w-1/2 w-full h-64 md:h-auto relative">
		<img
			src={bg}
			class="absolute inset-0 w-full h-full object-cover brightness-75"
			alt="Background"
		/>

		<!-- UPDATED CENTERING -->
		<div
			class="relative z-10 h-full flex flex-col justify-center
			items-center md:items-center
			p-6 md:p-0
			text-center md:text-center"
		>
			<img src={logo} alt="ESPorts Calculator Logo" class="w-24 mb-4 drop-shadow-xl" />

			<h1 class="text-3xl md:text-4xl text-white font-bold">ESports Calculator</h1>

			<p class="text-gray-200 text-lg mt-3 max-w-sm">Build by <b><i>RAM BHAKT ESPORTS</i></b></p>
		</div>
	</div>