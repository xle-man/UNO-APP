<script>
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { socketIO, waitingForPlayersScreenData, quitMatch, switchScreen, cardsData } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let cards = [];
    onMount(() => {
        get(socketIO).on("getCards", (data) => {
            cards = data;
            console.log(cardsData)
            console.log(data);
        });
        get(socketIO).on("startGame", () => {
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

<div>
    <ul>
        {#each cards as card}
            <li>{card.color} {card.symbol}</li>
        {/each}
    </ul>
</div>