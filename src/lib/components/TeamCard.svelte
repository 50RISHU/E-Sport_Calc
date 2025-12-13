<!-- src/lib/components/TeamCard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly, fade } from "svelte/transition";
  import type { Team } from "$lib/stores/tournamentStore";

  export let team!: Team;
  export let showGroup: boolean = false;

  const dispatch = createEventDispatcher();

  const handleDelete = () => dispatch("delete", { id: team.id });
</script>

<div
  transition:fly={{ y: 8, duration: 220 }}

  class="p-4 rounded-xl border border-gray-300 bg-[#F6E6C9]/60 flex items-center justify-between"
>
  <div>
    <div class="flex items-center gap-3">
      {#if team.logo}
        <img src={team.logo} alt="logo" class="w-12 h-12 rounded-md object-cover" />
      {:else}
        <div class="w-12 h-12 rounded-md bg-white/60 flex items-center justify-center border">
          <span class="text-sm">No</span>
        </div>
      {/if}
      <div>
        <p class="font-bold text-[#3D2C2E]">{team.name}</p>
        <p class="text-sm text-gray-600">Slot: {team.number} {team.tag ? ` • ${team.tag}` : ""}</p>
        {#if showGroup && team.group}
          <p class="text-sm text-gray-600">Group: {team.group}</p>
        {/if}
      </div>
    </div>
  </div>

  <button on:click={handleDelete} class="text-red-600 text-xl">🗑</button>
</div>
