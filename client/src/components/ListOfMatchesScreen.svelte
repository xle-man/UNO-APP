<script>
    import { fade } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { getAvailableMatches, listOfMatchesScreenData, socketIO, joinToGame, switchScreen, resetListOfMatchesScreenData } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    onMount(() => {
        get(socketIO).on("updateAvailableMatches", (list) => {
            listOfMatchesScreenData.update((data) => {
                data.matches = list;
                return data;
            });
        });
        getAvailableMatches();
    });


    onDestroy(() => {
        get(socketIO).off("updateAvailableMatches");
        resetListOfMatchesScreenData();
    });


    function onJoinToMatch(id) {
        joinToGame(id);
    }

</script>

<div class="screen-container" in:fade={{duration: 500}}>
    <button on:click={() => {switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN)}}>HOME</button>
    
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
                <button on:click={() => {onJoinToMatch(match.id)}}>JOIN</button>
            </div>
        {/each}
    </div>
</div>



<style>
    /* --- screen container --- */
     .screen-container {
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

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