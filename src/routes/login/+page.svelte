<script lang="ts">
	import LeftSideCard from '$lib/components/loginAndSignupLeftCard.svelte'
	let email = '';
	let password = '';

	const handleLogin = (e: Event) => {
		e.preventDefault();
		console.log('Login:', email, password);
	};
</script>

<div class="min-h-screen flex flex-col md:flex-row">
	<!-- LEFT SIDE (Background Image + Logo + Text) -->
	<LeftSideCard />

	<!-- RIGHT SIDE (Login Form) -->
	<div class="md:w-1/2 w-full flex justify-center items-center p-10 hover:bg-[#DCD7C9] transition">
		<div class="w-full max-w-sm">
			<h2 class="text-3xl font-semibold mb-6 text-gray-900">Welcome back</h2>

			<form on:submit={handleLogin} class="space-y-5">
				<div>
					<label class="block text-gray-600 mb-1" for="email">Email Address</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="form-control w-full bg-white border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 shadow-sm"
						placeholder="example@example.com"
						required
					/>
				</div>

				<div>
					<label class="block text-gray-600 mb-1" for="password">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="form-control w-full bg-white border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 shadow-sm"
						placeholder="*****"
						required
					/>
				</div>

				<button
					class="w-full bg-[#A27B5C] hover:bg-[#DCD7C9] text-gray py-3 rounded-md font-medium transition"
				>
					Login
				</button>

				<p>
					Don't have an account? <a href="/signup" class="text-yellow-600 hover:underline"
						>Sign Up</a
					>
				</p>
			</form>
		</div>
	</div>
</div>
