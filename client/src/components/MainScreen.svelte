<script>   
    import { get, writable } from "svelte/store";
    import { playerName, switchScreen, alertData, createGame } from "../javascripts/AppStore";
    import CONSTANTS from "../javascripts/Constants";

    let showDialog = get(playerName) ? false : true;
    let playerNameInputValue;
    const amountOfPlayersButtons = writable([
        {
            value: 2,
            isSelected: true
        },
        {
            value: 3,
            isSelected: false
        },
        {
            value: 4,
            isSelected: false
        }
    ]);


    function setName() {
        if(!playerNameInputValue) {
            alertData.set({type: CONSTANTS.ALERT_TYPE.INFO, message: "Player name is required.", time: 3000});
            return;
        }
        playerName.set(playerNameInputValue);
        showDialog = false;
    }


    function onCreateGame() {
        createGame(getSelectedAmountOfPlayers());
    }


    function onJoinToGame() {
        switchScreen(CONSTANTS.SCREEN.LIST_OF_MATCHES);
    }


    function changeAmountOfPlayersButton(value) {
        amountOfPlayersButtons.set(get(amountOfPlayersButtons).map((button) => {
            if(button.value === value)
                button.isSelected = true;
            else
                button.isSelected = false;
            return button;
        }));
    }


    function getSelectedAmountOfPlayers() {
        return get(amountOfPlayersButtons).filter(button => button.isSelected === true)[0].value;
    }

</script>


<div>
    <div>
        <button on:click={onCreateGame}>CREATE</button>
        <div>
            amount of players:
            {#each $amountOfPlayersButtons as button}
                <button class={`amountOfPlayersButton ${button.isSelected ? "amountOfPlayersButton-selected" : ""}`} on:click={() => {changeAmountOfPlayersButton(button.value)}}>
                    {button.value}
                </button>
            {/each}
        </div>
    </div>
    <div>
        <button on:click={onJoinToGame}>JOIN</button>
    </div>
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
    /* --- dialog --- */
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


    /* --- screen --- */
    .amountOfPlayersButton {
        background-color: gray;
        border: none;
        padding: 10px;
        transition: 0.3s;
    }

    .amountOfPlayersButton-selected {
        background-color: goldenrod;
    }
</style>