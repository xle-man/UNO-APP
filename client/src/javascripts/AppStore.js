import { writable, get } from 'svelte/store';
import { navigate } from "svelte-routing";
import CONSTANTS from "../javascripts/Constants";

export const matchID = writable(null);
export const playerName = writable("");
export const isSocketConnected = writable(false);
export const socketIO = writable(null);

export const alertData = writable({
    type: "INFO", 
    message: "",
    time: 0
});

export const waitingForPlayersScreenData = writable({
    matchID: "",
    players: [],
    requiredAmountOfPlayers: 0
});

export const listOfMatchesScreenData = writable({
    matches: [],
});

export const gameScreenData = writable({
    players: [],
    player: {},
    activeTurn: "",
    playedCards: []
});


export function switchScreen(screen) {
    navigate(`/${screen}`, {replace: true});
};


export function getAvailableMatches() {
    get(socketIO).emit("getAvailableMatches", (list) => {
        listOfMatchesScreenData.update((data) => {
            data.matches = list;
            return data;
        });
    });
};


export function createGame(amountOfPlayers) {
    get(socketIO).emit("createGame", get(playerName), amountOfPlayers, (response) => {
        console.log("createGame (result):", response.result);
        if(response.result) {
            console.log("createGame (data):", response.data);
            switchScreen(CONSTANTS.SCREEN.WAITING_FOR_GAME_SCREEN);
            waitingForPlayersScreenData.update(value => {
                value.matchID = response.data.id;
                value.players = response.data.players;
                value.requiredAmountOfPlayers = response.data.requiredAmountOfPlayers;
                return value;
            });
        }
        else {
            alert("error during creating match.");
        }
    });
};


export function joinToGame(matchID) {
    get(socketIO).emit("joinToGame", get(playerName), matchID, (response) => {
        console.log("joinToGame (result):", response.result);
        if(response.result) {
            console.log("joinToGame (data):", response.data);
            switchScreen(CONSTANTS.SCREEN.WAITING_FOR_GAME_SCREEN);
            waitingForPlayersScreenData.update(value => {
                value.matchID = response.data.id;
                value.players = response.data.players;
                value.requiredAmountOfPlayers = response.data.requiredAmountOfPlayers;
                return value;
            });
        }
        else {
            alert("error during joining to match.");
        }
    });
}


// export function startGame(matchID) {
//     get(socketIO).on("startGame", get(playerName), matchID, (response) => {
//         console.log("joinToGame (result):", response.result);
//         if(response.result) {
//             console.log("joinToGame (data):", response.data);
//             switchScreen(CONSTANTS.SCREEN.GAME_SCREEN);
//             waitingForPlayersScreenData.update(value => {
//                 value.matchID = response.data.id;
//                 value.players = response.data.players;
//                 value.requiredAmountOfPlayers = response.data.requiredAmountOfPlayers;
//                 return value;
//             });
//         }
//         else {
//             alert("error during joining to match.");
//         }
//     });
// }

export function quitMatch() {
    get(socketIO).emit("quitMatch", get(waitingForPlayersScreenData).matchID);
}