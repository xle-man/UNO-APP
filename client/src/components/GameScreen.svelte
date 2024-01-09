<script>
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import { socketIO, waitingForPlayersScreenData, quitMatch, switchScreen, gameScreenData, playerName, selectCard, setGameAlert, alertData} from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    import GameAlert from "./GameAlert.svelte";
   import IconUser from "./IconUser.svelte";


    onMount(() => {});


    function onConfirmAction() {

    }


    function onDrawAction() {

    }

    // ----- jakieś testowe funkcje ----- //
    // alertData.set({type: CONSTANTS.ALERT_TYPE.INFO, message: "Player name is required.", time: 3000});
    // setTimeout(() => {
    //     setGameAlert("Zmiana tej wartości spowoduje zmianę zawartości diva .game-alert. Dodatkowo, klasa .animate-width jest dodawana do diva, kiedy alertMessage nie jest puste, co powoduje uruchomienie animacji przejścia szerokości w CSS.", true, 0);
    // }, 2000);

    // setTimeout(() => {
    //     setGameAlert("a więc można powiedzieć, że działa :)", false, 3000);
    // }, 7000);

</script>

<div class="other-players-info-container"> <!--z-index[10]-->
    {#each $gameScreenData.match.players as player}
         <div class="other-players-info-box">
            <div class="other-player-info-avatar">
                <IconUser color="black" strokeWidth={2} />
            </div>
            <div class="other-player-info-amountOfCards">
                {player.amountOfCards}
            </div>
            <div style={player.id == $gameScreenData.player.id ? "color: red;" : ""}>
                {player.name}
            </div>
            {#if player.id == $gameScreenData.match.activePlayer}
                 <div>
                    [active]
                 </div>
            {/if}
         </div>
    {/each}
</div>

<div class="player-cards"> <!--z-index[20]-->
    {#each $gameScreenData.player.cards as card, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
            class={`card ${$gameScreenData.selectedCardIndex == index ? "selected-card" : ""}`} 
            style={`--card-transform: translate(-50%, -50%) rotate(${ $gameScreenData.player.cards.length>8 ? Math.round(( 120 / $gameScreenData.player.cards.length) * (index+1) - 60 - (60 / $gameScreenData.player.cards.length)) : Math.round(( 90 / $gameScreenData.player.cards.length) * (index+1) - 45 - (45 / $gameScreenData.player.cards.length)) }deg);`}
            on:click={() => {selectCard(index)}} 
        >
            <img 
                src={`./assets/images/cards/${card.src}.png`} 
                alt={`${card.src}_CARD`} 
                class="card-img" 
                style={$gameScreenData.selectedCardIndex != null ? $gameScreenData.selectedCardIndex == index ? "filter: none;" : "filter: grayscale(0.9);" : ""}
            >
        </div>
    {/each}
</div>

<div class="action-menu"> <!--z-index[30]-->
    <button disabled={$gameScreenData.match.activePlayer != $gameScreenData.player.id}>
        DRAW
    </button>
    <button disabled={$gameScreenData.match.activePlayer != $gameScreenData.player.id}>
        CONFIRM
    </button>
</div>

<GameAlert/> <!--z-index[40]-->


<div class="game-container">
    <div class="last-played-card-container">
        {#if $gameScreenData.match.playedCards[0]}
            <img id="last-played-card-img" src={`assets/images/cards/${$gameScreenData.match.playedCards[0].src}.png`} alt="">
        {:else}
             brak
        {/if}
    </div>
</div>


<style>
    /* --- other players info --- */
    .other-players-info-container {
        position: fixed;
        z-index: 10;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 10px;
        padding: 5px;
    }

    .other-players-info-box {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;
    }

    .other-player-info-avatar {
        width: 60px;
        height: 60px;
        padding: 5px;
        border: 2px solid black;
    }

    .other-player-info-amountOfCards {
        padding: 2.5px 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.2);
        user-select: none;
    } 


    /* --- action menu --- */
    .action-menu {
        position: fixed;
        z-index: 30;
        bottom: 5px;
        right: 5px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.2);
    }


    /* --- game container --- */
    .game-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }


    /* --- last played card --- */
    #last-played-card-img {
        height: 200px;
    }


    /* --- player cards --- */
    @property --angle {
        syntax: "<angle>";
        initial-value: 0deg;
        inherits: false;
    }

    :root {
        --card-transform: translate(-50%, -50%) rotate(0deg); /* Use any null transform (ex: translate(0), skew(0deg), etc)*/
    }

    .player-cards {
        position: fixed;
        z-index: 20;
        bottom: calc(0px + calc(200px / 2) - calc(200px * 0.1));
    }
    
    .card {
        background-size: cover;
        height: 200px;
        border-radius: 10px;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
        left: 50%;
        top: 50%;
        transform-origin: center 120%;
        transition: transform 0.3s ease-out;
        padding: 3px;
        background: white;

        transform: var(--card-transform);
    }

    .card-img {
        height: 100%;
        background-size: cover;
        transition: 0.5s ease-in-out;
    }


    .selected-card {
        transform: var(--card-transform) scale(1.05);
        background: linear-gradient(var(--angle), #818181,  #adadad, #ffffff);
        animation: selected-card 3s linear infinite;
    }

    @keyframes selected-card {
        0%     { 
            --angle: 0deg;
        }
        100%   { 
            --angle: 360deg;
        }
    }     

</style>