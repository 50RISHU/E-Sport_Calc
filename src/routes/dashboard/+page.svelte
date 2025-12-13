<script lang="ts">
    import TournamentCard from '$lib/components/TournamentCard.svelte';
    import logo from '$lib/images/esport-logo.png';
    import { tournamentStore, type Tournament } from '$lib/stores/tournamentStore';
    import { goto } from '$app/navigation';
    import { onDestroy } from 'svelte';

    let tournaments: Tournament[] = [];
    let selectedTournament: Tournament | null = null;
    let showModal = false;

    // auto-sync from store
    const unsubscribe = tournamentStore.subscribe((list) => {
        tournaments = list;
    });

    onDestroy(unsubscribe);

    const addTournament = () => goto('/tournament/create-tournament');

    // Logic to navigate to points page
    const navigateToPoints = (id: string) => goto(`/tournament/${id}/points`);

    const deleteTournament = (id: string) => {
        if (!confirm('Delete this tournament?')) return;
        tournamentStore.removeTournament(id);
    };

    const openDetails = (t: Tournament) => {
        selectedTournament = t;
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        selectedTournament = null;
    };

    const calculatePoints = (t: Tournament) => {
        goto(`/tournament/${t.id}/calculate-points`);
    }
</script>

<div>
    <div class="bg-[#A27B5C] p-6 flex flex-col items-center">
        <div class="logo-animation inline-block">
            <img src={logo} alt="logo" width="100" />
        </div>
        <h1 class="text-xl font-bold text-black text-center">
            ESPORTS<br />CALCULATOR
        </h1>
        <p class="text-sm text-black opacity-70 font-medium -mt-1">
            BY <b>RAM BHAKT ESPORTS</b>
        </p>
    </div>

    <div class="space-y-3 p-4 bg-[#DCD7C9] min-h-screen">
        {#each tournaments as t}
            <TournamentCard
                id={t.id}
                name={t.name}
                teams={t.teams.length}
                disableAction={false}
                on:edit={() => openDetails(t)} 
                on:delete={(e) => deleteTournament(e.detail)}
                on:calc={() => calculatePoints(t)}
            />
        {/each}
    </div>
</div>

<button
    on:click={addTournament}
    class="fixed bottom-6 right-6 bg-[#A27B5C] hover:bg-[#DCD7C9] transition text-white
        w-14 h-14 rounded-full flex items-center justify-center text-3xl
        shadow-xl transition-transform hover:scale-110 z-50"
>
    <i class="bi bi-plus-lg"></i>
</button>

{#if showModal && selectedTournament}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        on:click={closeModal}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Escape' && closeModal()}
    >
        <div class="bg-white rounded-lg p-6 w-96 max-w-full max-h-[90vh] flex flex-col" on:click|stopPropagation role="presentation">
            <h2 class="text-xl font-bold mb-2 text-[#3D2C2E]">{selectedTournament.name}</h2>
            <p class="mb-2 text-sm text-gray-600"><b>Total Teams:</b> {selectedTournament.teams.length}</p>

            <h3 class="font-semibold mt-2 mb-2">Teams List:</h3>
            
            <div class="overflow-y-auto flex-1 mb-4 pr-1">
                {#if selectedTournament.roundRobin}
                    <div class="space-y-3">
                        {#each Array(selectedTournament.groupCount) as _, i}
                            {@const groupLabel = String.fromCharCode(65 + i)}
                            {@const groupTeams = selectedTournament.teams.filter(t => t.group === groupLabel)}
                            
                            <div class="bg-[#F6E6C9]/40 rounded-lg p-3 border border-[#A27B5C]/20">
                                <div class="flex justify-between items-center mb-1">
                                    <h4 class="font-bold text-[#A27B5C]">Group {groupLabel}</h4>
                                    <span class="text-xs text-gray-500">{groupTeams.length} teams</span>
                                </div>
                                
                                {#if groupTeams.length > 0}
                                    <ul class="list-disc list-inside text-sm text-gray-800">
                                        {#each groupTeams as team}
                                            <li>{team.name}</li>
                                        {/each}
                                    </ul>
                                {:else}
                                    <p class="text-xs italic text-gray-400">No teams in this group</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <ul class="list-disc list-inside border p-3 rounded-lg bg-gray-50">
                        {#if selectedTournament.teams.length > 0}
                            {#each selectedTournament.teams as team}
                                <li>{team.name}</li>
                            {/each}
                        {:else}
                            <li class="list-none text-gray-400 italic">No teams added yet.</li>
                        {/if}
                    </ul>
                {/if}
            </div>

            <div class="flex gap-2 mt-auto pt-2 border-t">
                <button 
                    on:click={() => selectedTournament && navigateToPoints(selectedTournament.id)}
                    class="flex-1 px-4 py-2 bg-[#A27B5C] hover:bg-[#8f6a50] text-white rounded font-medium text-sm"
                >
                    Manage Points
                </button>

                <button
                    on:click={closeModal}
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded text-sm"
                >
                    Close
                </button>
            </div>
            <!-- <div class="w-full max-w-3xl">
                <button
                    on:click={calculatePoints}
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded text-sm"
                >
                    Calculate Points
                </button>
            </div> -->
        </div>
    </div>
{/if}