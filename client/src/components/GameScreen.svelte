<script>
  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { get } from "svelte/store";
  import {
    socketIO,
    waitingForPlayersScreenData,
    quitMatch,
    switchScreen,
    gameScreenData,
    playerName,
    selectCard,
    setGameAlert,
    alertData,
    setAlert,
    playCard,
    changeWildColorOption,
    drawCard,
    resetGameScreenData,
    getPlayerName,
    getActivePlayerIndex,
    convertWildColor,
  } from "../javascripts/AppStore";
  import CONSTANTS from "../javascripts/Constants";

  import GameAlert from "./GameAlert.svelte";
  import IconUser from "./IconUser.svelte";
    import IconConfirmButton from "./IconConfirmButton.svelte";
    import IconDrawButton from "./IconDrawButton.svelte";
    import IconPile from "./IconPile.svelte";

  let indexOfActivePlayer = 0;

  $: if($gameScreenData.match) {
    indexOfActivePlayer = getActivePlayerIndex();
  }

  onMount(() => {
    get(socketIO).on("updateGameData", (data) => {
      console.log("update game room:", data);
      gameScreenData.update((value) => {
        value.match.activePlayer = data.activePlayer;
        value.match.amountOfAvailableCards = data.amountOfAvailableCards;
        value.match.players = data.players;
        value.match.playedCards = data.playedCards;
        value.match.wildColor = data.wildColor;
        value.match.order = data.order;
        value.match.winner = data.winner;
        value.player = data.player;
        return value;
      });
    });
  });

  function onConfirmAction() {
    playCard();
  }

  function onDrawAction() {
    drawCard();
  }

  function onUnoAction() {}

  function onChangeWildColor(option) {
    changeWildColorOption(option);
  }

  function onHomeButtonClicked() {
    switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
    resetGameScreenData();
  }

  onDestroy(() => {
    get(socketIO).off("updateGameData");
  });

  // ----- jakieś testowe funkcje ----- //
  // alertData.set({type: CONSTANTS.ALERT_TYPE.INFO, message: "Player name is required.", time: 3000});
  // setTimeout(() => {
  //     setGameAlert("Zmiana tej wartości spowoduje zmianę zawartości diva .game-alert. Dodatkowo, klasa .animate-width jest dodawana do diva, kiedy alertMessage nie jest puste, co powoduje uruchomienie animacji przejścia szerokości w CSS.", true, 0);
  // }, 2000);

  // setTimeout(() => {
  //     setGameAlert("a więc można powiedzieć, że działa :)", false, 3000);
  // }, 7000);
</script>

<div class="game-container" in:fade={{ duration: 500 }}>
  <div class="top-right-fixed-container">
    <div class="amountOfAvailableCards-box">
      <IconPile width=2 color="#52525b" />
      <div class="amountOfAvailableCards-text">
        {$gameScreenData.match.amountOfAvailableCards}
      </div>
      <div class="amountOfAvailableCards-box-title">Pile</div>
    </div>
  </div>

  <div class="last-played-card-container">
    {#if $gameScreenData.match.wildColor}
      <div class="wildColor-box" style={`background-color: ${convertWildColor($gameScreenData.match.wildColor)};`} in:fade={{duration: 200}}></div>
    {/if}
    <img
      src={`./assets/images/cards/${$gameScreenData.match.playedCards[0].src}.png`}
      alt={`${$gameScreenData.match.playedCards[0].src}_CARD`}
      class="last-played-card-img"
    />
  </div>

  <!-- fixed element -->
  <div class="other-players-info-container">
    <!--z-index[10]-->
    {#each $gameScreenData.match.players as player}
      <div class="other-players-info-box" style={`opacity: ${player.afk ? "0.5" : "1"};`}>
        <div class="other-player-info-avatar">
          <IconUser color="var(--gray)" strokeWidth={2} />
        </div>
        <div class="other-player-info-amountOfCards">
          {player.afk ? "" : player.amountOfCards}
        </div>
        <div
          class="player-name" style={`color: ${player.id == $gameScreenData.player.id ? "var(--white)" : "var(--gray)"};`}
        >
          {player.name}
        </div>
        {#if player.afk}
          <div class="small-info-box offline-text-box" transition:fade={{duration: 500}}>OFFLINE</div>
        {/if}
        {#if player.amountOfCards === 1}
          <div class="small-info-box uno-text-box" transition:fade={{duration: 500}}>UNO</div>
        {/if}
      </div>
    {/each}
    <div class="active-player-marker" style={`transform: translateY(${5 + indexOfActivePlayer * 50 + indexOfActivePlayer * 10}px);`}></div>
    <!-- <div class="active-player-marker-arrow" style={`transform: translateY(${5 + indexOfActivePlayer * 50 + indexOfActivePlayer * 10}px);`}></div> -->
  </div>

  <!-- fixed element -->
  <div class="player-cards">
    <!--z-index[20]-->
    {#each $gameScreenData.player.cards as card, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class={`card ${
          $gameScreenData.selectedCardIndex == index ? "selected-card" : ""
        }`}
        style={`--card-transform: translate(-50%, -50%) rotate(${
          $gameScreenData.player.cards.length > 8
            ? Math.round(
                (120 / $gameScreenData.player.cards.length) * (index + 1) -
                  60 -
                  60 / $gameScreenData.player.cards.length
              )
            : Math.round(
                (90 / $gameScreenData.player.cards.length) * (index + 1) -
                  45 -
                  45 / $gameScreenData.player.cards.length
              )
        }deg);`}
        on:click={() => {
          selectCard(index);
        }}
      >
        <img
          src={`./assets/images/cards/${card.src}.png`}
          alt={`${card.src}_CARD`}
          class="card-img"
          style={$gameScreenData.selectedCardIndex != null
            ? $gameScreenData.selectedCardIndex == index
              ? "filter: none;"
              : "filter: grayscale(0);"
            : ""}
        />
      </div>
    {/each}
  </div>

  <!-- fixed element -->
  <div class="action-menu">
    <!--z-index[30]-->
    {#if $gameScreenData.wildColor.isVisible}
      <div class="wild-color-container" transition:fade={{ duration: 200 }}>
        <div class="wild-color-list">
          {#each $gameScreenData.wildColor.options as option}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="wild-color-option"
              on:click={() => onChangeWildColor(option)}
            >
              {option.color}
            </div>
          {/each}
        </div>
        {#if $gameScreenData.wildColor.color != null}
          <div
            class="wild-color-background"
            style={`transform: translateY(${$gameScreenData.wildColor.topOffset}px); background-color: ${$gameScreenData.wildColor.hex}`}
            in:fade={{duration: 500}}
          ></div>
        {/if}
      </div>
    {/if}
    <div class="button-container">
      <IconDrawButton color="#767676" width=2 onclick={onDrawAction} /> 
      <IconConfirmButton color="#767676" width=2 onclick={onConfirmAction} />
    </div>
  </div>

  <!-- fixed element -->
  {#if $gameScreenData.match.winner}
    <div
      class="game-over-container"
      in:fade={{ duration: 1000 }}
      out:fade={{ duration: 500 }}
    >
      <!--z-index[40]-->
      <div class="game-over-title heading">{$socketIO.id == $gameScreenData.match.winner ? "VICTORY" : "GAME OVER"}</div>
      <div class="winner-text subheading font-weight-normal">
        {@html $socketIO.id == $gameScreenData.match.winner ? "" : `Player <span class="winner-span">${getPlayerName($gameScreenData.match.winner).name}</span> won the game!`}
      </div>
      <button class="button home-button" on:click={onHomeButtonClicked}
        >HOME</button
      >
    </div>
  {/if}

  <!-- fixed element -->
  <GameAlert />
  <!--z-index[100]-->
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
    padding-left: 15px;
  }

  .active-player-marker {
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: var(--yellow);
    width: 5px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    height: 50px;
    transition: 0.5s ease-in-out;
    /* animation: active-player-marker 2s ease-in-out infinite alternate; */
  }

  /* .active-player-marker-arrow {
    position: absolute;
    top: -5px;
    left: 0px;
    background-color: var(--yellow);
    width: 10px;
    height: 25px;
    clip-path: polygon(0 0, 21% 0, 100% 100%, 0% 100%);
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    transition: 0.5s ease-in-out;
  } */

  @keyframes active-player-marker {
    0% {
      background-color: var(--gray);
    }
    100% {
      background-color: var(--white);
    }
  }


  .other-players-info-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  
  .other-player-info-avatar {
    width: 50px;
    height: 50px;
    padding: 5px;
    border: 2px solid var(--gray);
    background-color: var(--zinc-800);
    border-radius: 10px;
    padding: 5px;
  }

  .other-player-info-amountOfCards {
    /* padding: 2.5px 5px; */
    width: 25px;
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    background-color: var(--gray);
    color: var(--zinc-800);
    user-select: none;
  }

  .player-name {
    padding: 2.5px;
    max-width: 200px;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: 5s ease;
  }

  .player-name:hover {
    max-width: none;
  }

  .small-info-box {
    background-color: var(--zinc-800);
    border: 2px solid var(--yellow);
    color: var(--yellow);
    font-size: 14px;
    padding: 2.5px 5px;
    transition: ease-in-out 0.2s;
    border-radius: 10px;
    margin-left: 10px;
    user-select: none;
  }

  .uno-text-box {
    border: 2px solid var(--yellow);
    color: var(--yellow);
    animation: hithere 1.5s ease infinite;
  }

  .offline-text-box {
    border: 2px solid var(--gray);
    color: var(--gray);
  }

  @keyframes hithere {
      0%   { transform: scale(1,1)      translateY(0); }
      7%  { transform: scale(1.1,.9)   translateY(0); }
      21%  { transform: scale(.9,1.1)   translateY(-7.5px); }
      35%  { transform: scale(1.05,.95) translateY(0); }
      40%  { transform: scale(1,1)      translateY(-2.5px); }
      44%  { transform: scale(1,1)      translateY(0); }
      100% { transform: scale(1,1)      translateY(0); }
  }

  /* --- action menu --- */
  .action-menu {
    position: fixed;
    z-index: 30;
    bottom: 5px;
    right: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: 10px;
    padding: 5px;
  }

  .top-right-fixed-container {
    position: fixed;
    z-index: 30;
    top: 5px;
    right: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: 10px;
    padding: 5px;
  }

  .amountOfAvailableCards-box-title {
    height: 20px;
    font-size: 16px;
    line-height: 20px;
    position: absolute;
    top: calc(0px - calc(20px / 2));
    left: 10px;
    padding: 0px 5px;
    background-color: var(--zinc-800);
    color: var(--zinc-700);
    user-select: none;
  }

  .amountOfAvailableCards-box {
    position: relative;
    background-color: var(--zinc-800);
    border: 2px solid var(--zinc-700);
    width: 100px;
    transition: ease-in-out 0.2s;
    border-radius: 10px;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .amountOfAvailableCards-text {
    width: 40px;
    position: absolute;
    top: 20px;
    left: calc(calc(100% / 2) - calc(40px / 2));
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    color: var(--zinc-700);
    user-select: none;
  }

  .button-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  /* --- wild color options --- */
  .wild-color-container {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--zinc-800);
    border: 2px solid var(--white);
    border-radius: 10px;
  }

  .wild-color-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 5px;
  }

  .wild-color-option {
    padding: 0px 10px;
    z-index: 32;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  .wild-color-option:hover {
    cursor: pointer;
  }

  .wild-color-background {
    z-index: 31;
    position: absolute;
    top: 0;
    left: 5px;
    width: calc(100% - 10px);
    height: 30px;
    transition: 0.5s ease-in-out;
    border-radius: 10px;
  }

  /* --- winner container --- */
  .game-over-container {
    position: fixed;
    z-index: 40;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    background-color: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
  }

  .game-over-title {
    color: var(--white);
  }

  .home-button {
    border-color: var(--zinc-700);
    color: var(--gray);
    background: transparent;
  }

  .home-button:hover {
    /* background-color: rgba(255, 255, 255, 0.4); */
    border-color: var(--white);
    color: var(--white);
  }

  .winner-text {
    color: var(--gray);
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
  .last-played-card-container {
    position: relative;
  }

  .wildColor-box {
    position: absolute;
    top: 20px;
    right: -25px;
    width: 25px;
    height: 50px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: var(--zinc-800);
    border: 2px solid var(--white);
    border-left: 0px;
  }
  
  .last-played-card-img {
    background-size: cover;
    height: 200px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    left: 50%;
    top: 50%;
    transform-origin: center 120%;
    transition: transform 0.3s ease-out;
    padding: 3px;
    background: white;
    -webkit-user-drag: none;
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
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
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
    -webkit-user-drag: none;
  }

  .selected-card {
    transform: var(--card-transform) scale(1.2);
    /* background: linear-gradient(var(--angle), #818181, #adadad, #ffffff); */
    /* animation: selected-card 3s linear infinite; */
  }

  @keyframes selected-card {
    0% {
      --angle: 0deg;
    }
    100% {
      --angle: 360deg;
    }
  }

  /* .tooltip {
    position: relative;
  }

  .tooltip .tooltip-text {
    position: absolute;
    z-index: 1;
    top: 0px;
    left: 0px;
    background-color: black;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    visibility: hidden;
    overflow: auto;
    text-overflow: unset;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
  } */
</style>
