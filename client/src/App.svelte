<script>
  import { Router, Link, Route } from "svelte-routing";
  import GameScreen from "./components/GameScreen.svelte";
  import MainScreen from "./components/MainScreen.svelte";

</script>

<Router>
  <Route path="/" component={MainScreen} />
  <Route path="/game" component={GameScreen} />
</Router>