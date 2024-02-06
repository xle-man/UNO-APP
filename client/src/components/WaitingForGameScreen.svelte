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
    <div class="item match-item">
      <div class="inline-badge-container">
        <div class="badge">ID</div>
        <div>{$waitingForPlayersScreenData.matchID}</div>
      </div>
      <div class="players-badge">
        <div>Players</div>

        <!-- <div>
          {$waitingForPlayersScreenData.players
            .length}/{$waitingForPlayersScreenData.requiredAmountOfPlayers}
        </div> -->
      </div>

      <div class="playersList-container">
        {#each $waitingForPlayersScreenData.players as player, i}
          <div class="inline-badge-container">
            <div class="badge">{i + 1}</div>
            <div>{player.name}</div>
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
    align-items: flex-start;
  }

  .numberOfPlayers {
    position: absolute;
    top: 7.5px;
    right: 7.5px;
    border: 1px solid var(--yellow);
    border-radius: 10px;
    padding: 10px;
  }

  .match-item {
    border: none !important;
    align-items: flex-start;
  }

  .badge {
    border: 1px solid var(--yellow);
    border-radius: 5px;
    padding: 10px 20px 10px 20px;
    display: flex;
    justify-items: center;
    align-items: center;
  }

  .inline-badge-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .players-badge {
    border: 1px solid var(--yellow);
    border-radius: 5px;
    padding: 10px 20px 10px 20px;
    display: inline-flex;
    justify-items: center;
    text-align: center;
    align-items: center;
    width: 100%;
  }

  .players-badge div {
    width: max-content;
  }
</style>
