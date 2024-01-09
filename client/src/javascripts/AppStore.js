import { writable, get } from 'svelte/store';
import { navigate } from "svelte-routing";
import CONSTANTS from "../javascripts/Constants";

export const matchID = writable(null);
export const playerName = writable("");
export const isSocketConnected = writable(false);
export const socketIO = writable(null);
export const screen = writable(CONSTANTS.SCREEN.MAIN_SCREEN);

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
    matchID: "",
    selectedCardIndex: null,
    hint: "",
    alert: {
        message: "",
        isPermanent: false,
        time: 0
    },
    match: {
        players: [],
        activePlayer: "",
        playedCards: [],
        amountOfAvailableCards: 0,
        order: CONSTANTS.ORDER.CLOCKWISE,
        winner: "",
    },
    player: {
        id: "",
        amountOfCards: 0,
        cards: []
    }
});

// ----- sztywne dane gameScreenData do testów ----- //
// export const gameScreenData = writable({
//     matchID: "",
//     selectedCardIndex: null,
//     hint: "",
//     alert: {
//         message: "",
//         isPermanent: false,
//         time: 0
//     },
//     match: {
//         players: [
//             {
//                 id: "123jb2312lkb",
//                 name: "player1",
//                 amountOfCards: 7,
//             },
//             {
//                 id: "dasj3214v523",
//                 name: "player2",
//                 amountOfCards: 8,
//             },
//             {
//                 id: "12gjbf31Qlkb",
//                 name: "Kamil",
//                 amountOfCards: 7,
//             },
//             {
//                 id: "1das2e312lkb",
//                 name: "player3",
//                 amountOfCards: 16,
//             }
//         ],
//         activePlayer: "12gjbf31Qlkb",
//         playedCards: [
//             { 
//                 src: "BLUE_SKIP",
//                 color: "BLUE",
//                 isSpecial: true, 
//                 symbol: "SKIP" 
//             }
//         ],
//         AmountOfAvailableCards: 45,
//         order: CONSTANTS.ORDER.CLOCKWISE,
//         winner: null,
//     },
//     player: {
//         id: "12gjbf31Qlkb",
//         name: "Kamil",
//         amountOfCards: 7,
//         cards: [
//             { 
//                 src: "BLUE_SKIP",
//                 color: "BLUE",
//                 isSpecial: true, 
//                 symbol: "SKIP" 
//             },
//             { 
//                 src: "GREEN_DRAW2",
//                 color: "GREEN",
//                 isSpecial: true, 
//                 symbol: "DRAW2" 
//             },
//             { 
//                 src: "GREEN_DRAW2",
//                 color: "GREEN",
//                 isSpecial: true, 
//                 symbol: "DRAW2" 
//             }
//         ]
//     }
// });
// ------------------------------------------------- //


export const cardsData = writable([]);

export const topDiscard = writable({

});


export function switchScreen(value) {
    screen.set(value)
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
        if (response.result) {
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
        if (response.result) {
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


export function quitMatch() {
    get(socketIO).emit("quitMatch", get(waitingForPlayersScreenData).matchID);
}


export function setGameAlert(message, isPermanent, time) {
    gameScreenData.update(value => {
        value.alert = {
            message,
            isPermanent,
            time
        };
        return value;
    });
}


export function setAlert(type, message, time) {
    alertData.set({type, message, time});
}


export function selectCard(index) {
    if(get(gameScreenData).match.activePlayer == get(socketIO).id) {
        if(get(gameScreenData).selectedCardIndex == index) {
            gameScreenData.update(value => {
                value.selectedCardIndex = null;
                return value;
            });
        }
        else {
            gameScreenData.update(value => {
                value.selectedCardIndex = index;
                return value;
            });
        }
    }
    else {
        setAlert(CONSTANTS.ALERT_TYPE.INFO, "To play a card wait for your turn.", 3000);
    }
}


// ----- stare funkcje Oskara ----- //
// export function requestTurn(card) {
//     get(socketIO).emit("requestTurn", get(playerName), card, (ok, discard, cards) => {
//         console.log(ok)
//         if(ok)
//         {
//             console.log(ok)
//             console.log(discard)
//             console.log(cards)
//             cardsData.set(cards)
//         }
        
//     });
// };
// export function drawCard() {
//     get(socketIO).emit("drawCard", get(playerName), (ok, cards) => {
//         console.log(ok)
//         if (ok) {
//             console.log(cards)
//             cardsData.set(cards)
//         }

//     });
// };
// -------------------------------- //