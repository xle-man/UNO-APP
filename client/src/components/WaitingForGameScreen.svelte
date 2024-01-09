<script>
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { socketIO, waitingForPlayersScreenData, quitMatch, switchScreen, gameScreenData } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    onMount(() => {
        get(socketIO).on("updateWaitingForGameData", (data) => {
            console.log("update waiting room:", data);
            waitingForPlayersScreenData.update(value => {
                value.players = data.players;
                return value;
            });
        });
        get(socketIO).on("startGame", (data) => {
            console.log("Init data:", data);
            gameScreenData.update((value) => {
                value.match.amountOfAvailableCards = data.amountOfAvailableCards;
                value.match.activePlayer = data.activePlayer;
                value.match.players = data.players;
                value.player = data.player;
                return value;
            });
            switchScreen(CONSTANTS.SCREEN.GAME_SCREEN);
        });
    });


    onDestroy(() => {
        get(socketIO).off("updateWaitingForGameData");
        get(socketIO).off("startGame");
    });


    function onQuitMatch() {
        quitMatch();
        switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
    }

</script>


<div>{$waitingForPlayersScreenData.matchID}</div>
<div class="playersList-container">
    players:
    {#each $waitingForPlayersScreenData.players as player}
        <div class="playersList-item">
            {player.name}
        </div>
    {/each}
</div>
<div class="actualPlayersAmount-container">
    amount of players:
    {$waitingForPlayersScreenData.players.length}/{$waitingForPlayersScreenData.requiredAmountOfPlayers}
</div>

<button on:click={onQuitMatch}>QUIT</button>


<style>
    
</style>