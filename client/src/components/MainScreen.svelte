<script>   
    import { get } from "svelte/store";
    import { playerName, switchScreen, typeOfGameSelection, alertData, alertDisplayTime, createGame } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let showDialog = true;
    let playerNameInputValue;
    let playersAmountInputValue = 4;

    function setName() {
        if(!playerNameInputValue) {
            alertData.set({type: CONSTANTS.ALERT_TYPES.INFO, message: "Player name is required."});
            alertDisplayTime.set(3000);
            return;
        }
        playerName.set(playerNameInputValue);
        showDialog = false;
    }

    function onCreateGame() {
        typeOfGameSelection.set(CONSTANTS.TYPE_OF_GAME_SELECTION.CREATE);
        // createGame(playerNameInputValue, playersAmountInputValue);
        switchScreen(CONSTANTS.SCREEN.WAITING_FOR_GAME_SCREEN);
    }

    function onJoinGame() {
        typeOfGameSelection.set(CONSTANTS.TYPE_OF_GAME_SELECTION.JOIN);
        switchScreen(CONSTANTS.SCREEN.LIST_OF_MATCHES);
    }

</script>

<div>
    <button on:click={onCreateGame}>CREATE</button>
    <button on:click={onJoinGame}>JOIN</button>
</div>


{#if showDialog}
    <div class="dialog-container"> <!--z-index[10]-->
        <div class="dialog-box">
            <div class="dialog-title">BEFORE YOU BEGIN</div>
            <div class="input-item">
                <input type="text" name="playerName" required bind:value={playerNameInputValue}>
                <label for="playerName">Your name</label>
            </div>
            <button on:click={setName}>SET</button>
        </div>
    </div>
{/if}


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