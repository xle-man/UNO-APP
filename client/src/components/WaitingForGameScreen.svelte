<script>
    import { get } from "svelte/store";
    import { alertData, alertDisplayTime, createGame, playerName, playersWaitingForGame, typeOfGameSelection } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let showDialog = true;
    let playerNameInputValue;
    let playersAmountInputValue;

    function createOrJoinToMatch() {
        if(get(typeOfGameSelection) == CONSTANTS.TYPE_OF_GAME_SELECTION.CREATE) {
            if(!playerName) {
                alertData.set({type: CONSTANTS.ALERT_TYPES.INFO, message: "Player name is required."});
                alertDisplayTime.set(3000);
                return;
            }
            if(!playersAmountInputValue) {
                alertData.set({type: CONSTANTS.ALERT_TYPES.INFO, message: "Amount of players is required."});
                alertDisplayTime.set(3000);
                return;
            }
            if(!/^\d+$/.test(playersAmountInputValue)) {
                alertData.set({type: CONSTANTS.ALERT_TYPES.INFO, message: "Amount of players must be a number."});
                alertDisplayTime.set(3000);
                return;
            }
            if(parseInt(playersAmountInputValue) < 2 || parseInt(playersAmountInputValue) > 4) {
                alertData.set({type: CONSTANTS.ALERT_TYPES.INFO, message: "Amount of players must be a number between 2 and 4."});
                alertDisplayTime.set(3000);
                return;
            }

            playerName.set(playerNameInputValue);
            createGame(parseInt(playersAmountInputValue));
            showDialog = false;
        }
        else {

        }
    }

    function quitMatch() {
        // quit match
    }

</script>

{#if showDialog}
    <div class="dialog-container"> <!--z-index[10]-->
        <div class="dialog-box">
            <div class="dialog-title">SET YOUR NAME</div>
            <div class="input-item">
                <input type="text" name="playerName" required bind:value={playerNameInputValue}>
                <label for="playerName">Your name</label>
            </div>
            {#if $typeOfGameSelection == CONSTANTS.TYPE_OF_GAME_SELECTION.CREATE}
                <div class="input-item">
                    <input type="text" name="playersAmount" required bind:value={playersAmountInputValue}>
                    <label for="playersAmount">Amount of players</label>
                </div>
            {/if}
            <button on:click={createOrJoinToMatch}>SET</button>
        </div>
    </div>
{/if}

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
    .dialog-container {
        position: fixed;
        z-index: 10;
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(1.2px);
    }

    .dialog-box {
        padding: 10px 20px;
        background-color: lightgray;    
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }

    .dialog-title {
        font-family: "TommySoftMedium";
    }

    .input-item {
        position: relative;
    }

    .input-item input {
        height: 40px;
        padding: 0px 8px;
        background-color: transparent;
        border: 2px solid black;
        outline: none;
    }

    .input-item label {
        position: absolute;
        top: 10px;
        left: 10px;
        transition: 0.3s ease-in;
        pointer-events: none;
        user-select: none;
        background-color: lightgray;
    }

    .input-item input:focus ~ label {
        padding: 0px 5px;
        font-size: 12px;
        top: -8px;
    }

    .input-item input:valid ~ label {
        padding: 0px 5px;
        font-size: 12px;
        top: -8px;
    }
</style>