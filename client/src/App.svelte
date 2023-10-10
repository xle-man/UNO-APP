<script>
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { io } from "socket.io-client";
  import { isSocketConnected, socketIO } from "./javascripts/AppStore";
  import CONSTANTS from "./javascripts/Constants";

  import GameScreen from "./components/GameScreen.svelte";
  import MainScreen from "./components/MainScreen.svelte";
  import WaitingForGameScreen from "./components/WaitingForGameScreen.svelte";
  import Alert from "./components/Alert.svelte";
   import ListOfMatchesScreen from "./components/ListOfMatchesScreen.svelte";

  export let url;

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

</script>

{#if $isSocketConnected}
  <Router {url}>
    <Route path="/">
      <MainScreen />
    </Route>
    <Route path="/game">
      <GameScreen />
    </Route>
    <Route path="/waitingForGame">
      <WaitingForGameScreen />
    </Route>
    <Route path="/listOfMatches">
      <ListOfMatchesScreen />
    </Route>
  </Router>
{:else}
  <div>Connecting to the server...</div>
{/if}

<Alert />