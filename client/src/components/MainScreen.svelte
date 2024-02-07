<script>
  import { get, writable } from "svelte/store";
  import {
    playerName,
    switchScreen,
    alertData,
    createGame,
  } from "../javascripts/AppStore";
  import CONSTANTS from "../javascripts/Constants";
  import { fade } from "svelte/transition";

  let showDialog = get(playerName) ? false : true;
  let playerNameInputValue;
  const amountOfPlayersButtons = writable([
    {
      value: 2,
      isSelected: true,
    },
    {
      value: 3,
      isSelected: false,
    },
    {
      value: 4,
      isSelected: false,
    },
  ]);
  window.addEventListener('keydown', onKeyDown);

  function setName() {
    if (!playerNameInputValue) {
      alertData.set({
        type: CONSTANTS.ALERT_TYPE.INFO,
        message: "Player name is required.",
        time: 3000,
      });
      return;
    }
    playerName.set(playerNameInputValue);
    showDialog = false;
    window.removeEventListener('keydown', onKeyDown);
  }

  function onCreateGame() {
    createGame(getSelectedAmountOfPlayers());
  }

  function onJoinToGame() {
    switchScreen(CONSTANTS.SCREEN.LIST_OF_MATCHES);
  }

  function changeAmountOfPlayersButton(value) {
    amountOfPlayersButtons.set(
      get(amountOfPlayersButtons).map((button) => {
        if (button.value === value) button.isSelected = true;
        else button.isSelected = false;
        return button;
      })
    );
  }

  function getSelectedAmountOfPlayers() {
    return get(amountOfPlayersButtons).filter(
      (button) => button.isSelected === true
    )[0].value;
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      setName();
    }
  }
</script>

<div class="screen-container" in:fade={{ duration: 500 }}>
  <div class="box">
    <div>
      <div class="heading">GAME</div>
    </div>
    <div class="boxes">
      <div class="padding-top">
        <button class="button" on:click={onJoinToGame}>JOIN</button>
      </div>
      <div class="vertical-line"></div>
      <div class="create-box padding-top">
        <button class="button" on:click={onCreateGame}>CREATE</button>
        <div>Players:</div>
        <div class="amountOfPlayersContainer">
          {#each $amountOfPlayersButtons as button}
            <button
              class={`amountOfPlayersButton ${
                button.isSelected ? "amountOfPlayersButton-selected" : ""
              }`}
              on:click={() => {
                changeAmountOfPlayersButton(button.value);
              }}
            >
              {button.value}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- fixed element -->
  {#if showDialog}
    <div class="dialog-container">
      <!--z-index[10]-->
      <div class="box">
        <div>
          <div class="heading">UNO</div>
          <div class="subheading">Card Game</div>
        </div>
        <div class="input-item">
          <input
            type="text"
            name="playerName"
            required
            bind:value={playerNameInputValue}
          />
          <label for="playerName">Your name</label>
        </div>
        <button class="button" on:click={setName}>SET</button>
      </div>
    </div>
    {/if}
  </div>  

<style>
  /* --- screen container --- */
  .screen-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .padding-top {
    padding-top: 10px;
  }

  .vertical-line {
    height: 165px;
    border-left: 3px solid var(--zinc-700);
    border-radius: 10px;
  }

  .boxes {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
  }

  /* --- dialog --- */
  .dialog-container {
    position: fixed;
    z-index: 10;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--zinc-800);
  }

  .white {
    color: var(--white) !important;
  }

  .create-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .input-item {
    position: relative;
  }

  .input-item input {
    height: 40px;
    padding: 0px 8px;
    background-color: transparent;
    border: 2px solid var(--zinc-700);
    outline: none;
    color: white;
    transition: ease-in-out 0.2s;
    border-radius: 10px;
  }

  .input-item input:focus {
    border: 2px solid var(--white);
  }

  .input-item input:focus ~ label {
    color: var(--white);
  }

  .input-item label {
    position: absolute;
    top: 10px;
    left: 10px;
    transition: 0.3s ease-in;
    pointer-events: none;
    user-select: none;
    background-color: var(--zinc-800);
    color: var(--gray);
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
  .amountOfPlayersContainer {
    display: flex;
    gap: 5px;
  }

  .amountOfPlayersButton {
    border: none;
    padding: 10px;
    transition: 0.3s;
    border: 2px solid var(--zinc-700);
    background-color: var(--zinc-800);
    color: var(--zinc-700);
    border-radius: 10px;
  }

  .amountOfPlayersButton:hover {
    cursor: pointer;
  }

  .amountOfPlayersButton-selected {
    border-color: var(--white);
    color: var(--white);
  }
</style>
