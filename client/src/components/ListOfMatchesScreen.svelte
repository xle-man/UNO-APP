<script>
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { getAvailableMatches, listOfMatchesScreenData, socketIO } from "../javascripts/AppStore";

    onMount(() => {
        get(socketIO).on("updateAvailableMatches", (list) => {
            listOfMatchesScreenData.update((value) => {
                value.matches = list;
                return value;
            });
        });
        getAvailableMatches();
    });

    onDestroy(() => {
        get(socketIO).off("updateAvailableMatches");
    });


    function joinToMatch(id) {
        console.log("JOIN to Match with id:", id);
    }

</script>

<div class="listOfMatches-container">
    {#each $listOfMatchesScreenData.matches as match}
        <div class="listOfMatches-item">
            <div class="listOfMatches-item-title">{match.id}</div>
            <div class="amoutOfPlayers-info">
                {match.players.length}/{match.requiredAmountOfPlayers}
            </div>
            <div>
                {#each match.players as player}
                    <div>{player.name}</div>
                {/each}
            </div>
            <button on:click={() => {joinToMatch(match.id)}}>JOIN</button>
        </div>
    {/each}
</div>


<style>
    .listOfMatches-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .listOfMatches-item {
        padding: 10px;
        background-color: lightgray;
    }
</style>