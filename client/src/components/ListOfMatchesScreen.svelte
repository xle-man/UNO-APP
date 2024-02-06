<script>
  import { fade } from "svelte/transition";
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import {
    getAvailableMatches,
    listOfMatchesScreenData,
    socketIO,
    joinToGame,
    switchScreen,
    resetListOfMatchesScreenData,
  } from "../javascripts/AppStore";
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

<div class="screen-container bordered-bottom" in:fade={{ duration: 500 }}>
  <div class="box">
    <div>
      <div class="heading">JOIN</div>
      <div class="subheading">List of matches</div>
    </div>
    <button
      class="button"
      on:click={() => {
        switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
      }}>HOME</button
    >

    <div class="listOfMatches-container">
      {#each $listOfMatchesScreenData.matches as match}
        <div class="item">
          <div class="listOfMatches-item-title">ID: {match.id}</div>
          <div class="amountOfPlayers-info">
            Players: {match.players.length}/{match.requiredAmountOfPlayers}
            {#each match.players as player, i}
              <div class="player">{i + 1}. {player.name}</div>
            {/each}
          </div>
          <button
            class="button"
            on:click={() => {
              onJoinToMatch(match.id);
            }}>JOIN</button
          >
        </div>
      {/each}
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

  .listOfMatches-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }
</style>
