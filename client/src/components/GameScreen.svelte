<script>
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { socketIO, waitingForPlayersScreenData, quitMatch, switchScreen, cardsData, requestTurn, topDiscard, drawCard} from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let cards = [];
    onMount(() => {
        get(socketIO).on("getCards", (data, discard) => {
            cardsData.set(data);
            topDiscard.set(discard);
            console.log(get(cardsData));
            console.log(data);
            console.log(get(topDiscard));
        });
    });



    function onQuitMatch() {
        quitMatch();
        switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
    }

    const onRequestTurn = (card) =>
    {
        console.log("siu")
        requestTurn(card)
    }
    const onDrawCard = () =>
    {
        console.log("siu")
        drawCard()
    }
</script>

<div>
    <ul>
        <li><button on:click={() => {onDrawCard()}}>Draw a card</button></li>
        {#each $cardsData as card}
            <li><button on:click={() => {onRequestTurn(card)}}>{card.color} {card.symbol}</button></li>
        {/each}
    </ul>
</div>