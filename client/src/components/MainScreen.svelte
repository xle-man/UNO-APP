<script>   
    import { onMount } from "svelte";
    import { switchScreen, typeOfGameSelection } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    function createGame() {
        typeOfGameSelection.set(CONSTANTS.TYPE_OF_GAME_SELECTION.CREATE);
        switchScreen(CONSTANTS.SCREEN.WAITING_FOR_GAME_SCREEN);
    }

    function joinGame() {
        typeOfGameSelection.set(CONSTANTS.TYPE_OF_GAME_SELECTION.JOIN);
        switchScreen(CONSTANTS.SCREEN.LIST_OF_MATCHES);
    }

</script>

<div>
    <button on:click={createGame}>CREATE</button>
    <button on:click={joinGame}>JOIN</button>
</div>