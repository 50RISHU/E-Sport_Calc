<!-- src/routes/tournament/create-tournament/+page.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { tournamentStore, type Tournament } from "$lib/stores/tournamentStore";
  import TournamentCard from "$lib/components/TeamCard.svelte"; // optional preview usage
  import { onMount, onDestroy } from "svelte";

  let tournamentName = "";
  let roundRobin = false;
  let groupCount = 2;

  // preview (optional)
  let tournaments: Tournament[] = [];
  const unsubscribe = tournamentStore.subscribe((v) => (tournaments = v));
  onDestroy(unsubscribe);

  const increaseGroup = () => {
    if (groupCount < 10) groupCount++;
  };

  const decreaseGroup = () => {
    if (groupCount > 2) groupCount--;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!tournamentName.trim()) {
      alert("Tournament name is required");
      return;
    }

    const newId = tournamentStore.addTournament({
      name: tournamentName.trim(),
      roundRobin,
      groupCount,
    });

    // clear local fields
    tournamentName = "";
    roundRobin = false;
    groupCount = 2;

    // navigate to points (or teams) for the new tournament
    goto(`/tournament/${newId}/points`);
  };

  onMount(() => {
    // nothing special; subscription is handled above
  });

  // cleanup if needed
  // $: when component destroyed unsubscribe
</script>

<div class="bg-[#DCD7C9] min-h-screen p-3 space-y-8">
  <div class="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-[#A27B5C]/30">
    <h2 class="text-xl font-bold text-[#3D2C2E] mb-3">Create New Tournament</h2>

    <form on:submit={handleSubmit} class="space-y-5">
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700">Tournament Name</label>
        <input
          type="text"
          bind:value={tournamentName}
          required
          class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A27B5C]"
        />
      </div>

      <div class="flex items-center gap-3">
        <input type="checkbox" bind:checked={roundRobin} class="w-5 h-5 accent-[#A27B5C]" />
        <label class="text-sm text-gray-700">Enable Round Robin</label>
      </div>

      {#if roundRobin}
      <div class="mt-4 p-4 bg-[#F6E6C9] rounded-xl border border-[#A27B5C]/40">
        <p class="text-sm font-semibold mb-3 text-gray-700">Customize your groups</p>

        <div class="flex items-center justify-between">
          <button type="button" on:click={decreaseGroup} class="px-4 py-2 bg-white shadow rounded-lg border text-xl">–</button>
          <div class="text-center">
            <p class="text-3xl font-bold">{groupCount}</p>
            <p class="text-sm text-gray-600">Groups</p>
          </div>
          <button type="button" on:click={increaseGroup} class="px-4 py-2 bg-white shadow rounded-lg border text-xl">+</button>
        </div>

        <div class="mt-4 flex justify-center gap-6 text-sm font-medium">
          {#each Array(groupCount) as _, i}
            <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border shadow">
              {String.fromCharCode(65 + i)}
            </div>
          {/each}
        </div>
      </div>
      {/if}

      <button class="w-full py-3 rounded-lg bg-[#A27B5C] text-white font-semibold text-lg shadow-md hover:bg-[#8F6A50] transition">N E X T</button>
    </form>
  </div>

  <div class="space-y-3">
    {#each tournaments as t}
      <!-- optional preview component usage -->
      <div class="p-2"><strong class="text-[#3D2C2E]">{t.name}</strong> — {t.teams.length} teams</div>
    {/each}
  </div>
</div>
