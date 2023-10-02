<script>
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { io } from "socket.io-client";
  import { isSocketConnected } from "./javascripts/AppStore";

  import GameScreen from "./components/GameScreen.svelte";
  import MainScreen from "./components/MainScreen.svelte";
  import SingInScreen from "./components/SingInScreen.svelte";


  export let url;

  let socket = io("http://localhost:3000");

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
    <Route path="/signIn">
      <SingInScreen />
    </Route>
    <Route path="/game">
      <GameScreen />
    </Route>
  </Router>
{:else}
  <div>Connecting to the server...</div>
{/if}