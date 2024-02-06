<script>
  import { fade } from "svelte/transition";
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import {
    socketIO,
    waitingForPlayersScreenData,
    quitMatch,
    switchScreen,
    gameScreenData,
    resetWaitingForPlayersScreenData,
  } from "../javascripts/AppStore";
  import CONSTANTS from "../javascripts/Constants";

  onMount(() => {
    get(socketIO).on("updateWaitingForGameData", (data) => {
      console.log("update waiting room:", data);
      waitingForPlayersScreenData.update((value) => {
        value.players = data.players;
        return value;
      });
    });
    get(socketIO).on("startGame", (data) => {
      console.log("Init data:", data);
      gameScreenData.update((value) => {
        value.matchID = data.matchID;
        value.match.amountOfAvailableCards = data.amountOfAvailableCards;
        value.match.playedCards = data.playedCards;
        value.match.activePlayer = data.activePlayer;
        value.match.players = data.players;
        value.player = data.player;
        return value;
      });
      resetWaitingForPlayersScreenData();
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

<div class="screen-container" in:fade={{ duration: 500 }}>
  <div class="box">
    <div>
      <div class="heading">MATCH</div>
    </div>
    <div class="item">
      <div>ID: {$waitingForPlayersScreenData.matchID}</div>
      <div class="playersList-container">
        Players: {$waitingForPlayersScreenData.players
          .length}/{$waitingForPlayersScreenData.requiredAmountOfPlayers}
        {#each $waitingForPlayersScreenData.players as player, i}
          <div class="playersList-item">
            {i + 1}. {player.name}
          </div>
        {/each}
      </div>
      <button class="button" on:click={onQuitMatch}>QUIT</button>
    </div>
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
</style>
