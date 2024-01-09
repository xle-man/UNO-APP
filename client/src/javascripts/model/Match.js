import CONSTANTS from "../Constants";

class Match {
    players;
    state;
    activePlayer;
    availableCards;
    playedCards;
    order;
    winner;
    requiredAmountOfPlayers;

    constructor() {
        this.players = [];
        this.state = CONSTANTS.GAME_STATE.WAITING_FOR_PLAYERS;
        this.activePlayer = null;
        
    }
}