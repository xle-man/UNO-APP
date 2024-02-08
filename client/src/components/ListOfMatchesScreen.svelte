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
  import IconRefreshButton from "./IconRefreshButton.svelte";
  import IconUser from "./IconUser.svelte";

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

  function onRefresh() {
    getAvailableMatches();
  }
</script>

<div class="screen-container" in:fade={{ duration: 500 }}>
  <div class="box">
    <div>
      <div class="heading">JOIN</div>
      <div class="subheading">List of matches</div>
    </div>
    <div class="buttons-container">
      <button
        class="button"
        on:click={() => {
          switchScreen(CONSTANTS.SCREEN.MAIN_SCREEN);
        }}>HOME</button
      >
      <IconRefreshButton color="#767676" width="2" onclick={onRefresh} />
    </div>

    <div class="listOfMatches-container">
      {#if $listOfMatchesScreenData.matches.length > 0 && !$listOfMatchesScreenData.isFetching}
        {#each $listOfMatchesScreenData.matches as match}
          <div class="item" style="min-width: 350px;">
            <div class="list-inline-badge-container">
              <div class="small-badge">ID</div>
              <div class="match-id">
                <div>{match.id}</div>
              </div>
              <div class="small-badge" style="border: 2px solid var(--yellow);">
                {match.players.length}/{match.requiredAmountOfPlayers}
              </div>
            </div>
            <hr class="hr" />
            <div class="players-list" style="gap: 10px;">
              {#each match.players as player}
                <div class="player-item">
                  <div
                    class="player-item-icon"
                    style="width: 30px; height: 30px; padding: 4px; border-width: 1.5px;"
                  >
                    <IconUser strokeWidth={1.5} color="var(--white)" />
                  </div>
                  <p class="player-item-name">{player.name}</p>
                </div>
              {/each}
            </div>
            <div class="button-container">
              <button
                class="button"
                on:click={() => {
                  onJoinToMatch(match.id);
                }}>JOIN</button
              >
            </div>
          </div>
        {/each}
      {:else if $listOfMatchesScreenData.matches.length === 0 && !$listOfMatchesScreenData.isFetching}
        <div class="list-status">There are no matches</div>
      {:else}
        <div class="list-status">Fetching data...</div>
      {/if}
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

  .listOfMatches-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
  }

  .buttons-container {
    display: flex;
    gap: 10px;
  }

  .list-status {
    color: var(--gray);
  }

  .match-id {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }
</style>
