<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let id: number;
	export let name: string;
	export let teams: number;
	export let disableAction: boolean = false;

	const dispatch = createEventDispatcher();

	let menuOpen = false;
	const toggleMenu = () => (menuOpen = !menuOpen);

	const edit = () => dispatch('edit', id);
	const del = () => dispatch('delete', id);
</script>

<!-- TOURNAMENT CARD -->
<div
	class="bg-white p-3 rounded-lg shadow-sm border flex justify-between items-center
  hover:shadow-md hover:-translate-y-1 transition-all"
>
	<div>
		<h3 class="text-base font-semibold">{name}</h3>
		<p class="text-sm text-gray-600">Teams: {teams}</p>
	</div>

	<!-- Desktop Icons -->
	{#if !disableAction}
		<div class="hidden md:flex gap-3 text-xl">
			<i
				class="bi bi-pencil-square text-blue-600 cursor-pointer hover:text-blue-800"
				on:click={edit}
			></i>

			<i class="bi bi-trash text-red-600 cursor-pointer hover:text-red-800" on:click={del}></i>
		</div>
	{/if}

	<!-- Mobile Menu -->
	{#if !disableAction}
		<div class="md:hidden relative">
			<button class="text-xl px-2" on:click={toggleMenu}>⋮</button>

			{#if menuOpen}
				<div
					class="absolute right-0 top-8 bg-white shadow-md rounded-md w-32 py-1 z-20 border animate-slideDown"
				>
					<button
						class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
						on:click={edit}
					>
						<i class="bi bi-pencil-square text-blue-600"></i> Edit
					</button>

					<button
						class="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
						on:click={del}
					>
						<i class="bi bi-trash text-red-600"></i> Delete
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideDown {
		animation: slideDown 0.2s ease-out;
	}
</style>
