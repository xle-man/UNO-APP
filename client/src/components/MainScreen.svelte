<script>   
    import { onMount } from "svelte";
    import { isSignedIn, switchScreen } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    onMount(() => {
        if(!$isSignedIn) {
            switchScreen(CONSTANTS.SCREEN.SIGN_IN_SCREEN);
        }
    })
    

    function createGame() {
        // create a Match 
    }

    function joinGame() {
        // show list of available Matches
    }

</script>

<div>
    <button on:click={createGame}>CREATE</button>
    <button on:click={joinGame}>JOIN</button>
</div>