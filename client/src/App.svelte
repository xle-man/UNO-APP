<script>
  import { onDestroy, onMount } from "svelte";
  import { Router, Route } from "svelte-routing";
  import { io } from "socket.io-client";
  import { gameScreenData, isSocketConnected, screen, socketIO, waitingForPlayersScreenData } from "./javascripts/AppStore";
  import CONSTANTS from "./javascripts/Constants";

  import Alert from "./components/Alert.svelte";
  import GameScreen from "./components/GameScreen.svelte";
  import MainScreen from "./components/MainScreen.svelte";
  import WaitingForGameScreen from "./components/WaitingForGameScreen.svelte";
  import ListOfMatchesScreen from "./components/ListOfMatchesScreen.svelte";
    import { get } from "svelte/store";

  let socket = io(CONSTANTS.SERVER_URL);
  socketIO.set(socket);

  socket.on("connect", () => {
    console.log("CONNECT");
    console.log(socket);
    isSocketConnected.set(true);
  });

  socket.on("connect_error", () => {
    console.log("ERROR");
    isSocketConnected.set(false);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECT");
    isSocketConnected.set(false);
  });

  onDestroy(() => {
    if(get(waitingForPlayersScreenData).matchID != "") {
      get(socketIO).emit("disconnect", get(waitingForPlayersScreenData).matchID);
    }
    else if(get(gameScreenData).matchID != "") {
      get(socketIO).emit("disconnect", get(gameScreenData).matchID);
    }
  });

</script>

<div class="main-container">
  {#if $isSocketConnected}
    {#if $screen == CONSTANTS.SCREEN.MAIN_SCREEN}
      <MainScreen />
    {:else if $screen == CONSTANTS.SCREEN.GAME_SCREEN}
      <GameScreen />
    {:else if $screen == CONSTANTS.SCREEN.WAITING_FOR_GAME_SCREEN}
      <WaitingForGameScreen />
    {:else if $screen == CONSTANTS.SCREEN.LIST_OF_MATCHES}
      <ListOfMatchesScreen />
    {/if}
  {:else}
    <div>Connecting to the server...</div>
  {/if}
</div>

<Alert />


<style>
  .main-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(227, 227, 227); 
    /* background-color: rgb(29, 29, 35);  */
  }
</style>