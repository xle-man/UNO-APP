<script>
    import { get } from "svelte/store";
    import { alertData, alertDisplayTime, createGame, playerName, playersWaitingForGame, typeOfGameSelection } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    function quitMatch() {
        // quit match
    }

</script>

<div class="playersList-container">
    {#each $playersWaitingForGame as player}
        <div class="playersList-item">
            {player.name}
        </div>
    {/each}
</div>
<div class="actualPlayersAmount-container">
    -/-
</div>

<button>QUIT</button>


<style>
    
</style>