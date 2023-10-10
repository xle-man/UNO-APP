import { writable, get } from 'svelte/store';
import { navigate } from "svelte-routing";
import CONSTANTS from "../javascripts/Constants";

export const matchID = writable(null);
export const playerID = writable(null);
export const playerName = writable("");
export const isSocketConnected = writable(false);
export const socketIO = writable(null);

export const alertDisplayTime = writable(0);
export const alertData = writable({type: "INFO", message: ""});

export const typeOfGameSelection = writable("");
export const playersWaitingForGame = writable([]);
export const requiredAmountOfPlayers = writable(0);

export const waitingForPlayersScreenData = writable({
    type: "",
    players: [],
    requiredAmountOfPlayers: 0
});

export const listOfMatchesScreenData = writable({
    matches: [],
});


export function switchScreen(screen) {
    navigate(`/${screen}`, {replace: true});
};


export function createGame(playerName, amountOfPlayers) {
    get(socketIO).emit("createGame", playerName, amountOfPlayers);
};

export function getAvailableMatches() {
    get(socketIO).emit("getAvailableMatches");
};
