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
    isFetching: false,
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
        wildColor: null
    },
    player: {
        id: "",
        amountOfCards: 0,
        cards: []
    },
    wildColor: {
        isVisible: false,
        color: null,
        topOffset: null,
        hex: null,
        options: [
            {
                color: CONSTANTS.COLORS.BLUE,
                hex: "#0974b7",
                topOffset: 5,
            },
            {
                color: CONSTANTS.COLORS.GREEN,
                hex: "#85c042",
                topOffset: 35,
            },
            {
                color: CONSTANTS.COLORS.RED,
                hex: "#db3a25",
                topOffset: 65,
            },
            {
                color: CONSTANTS.COLORS.YELLOW,
                hex: "#fed439",
                topOffset: 95,
            }
        ],
         
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


export function resetWaitingForPlayersScreenData() {
    waitingForPlayersScreenData.set({
        matchID: "",
        players: [],
        requiredAmountOfPlayers: 0
    });
}


export function resetGameScreenData() {
    gameScreenData.set({
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
            wildColor: null
        },
        player: {
            id: "",
            amountOfCards: 0,
            cards: []
        },
        wildColor: {
            isVisible: false,
            color: null,
            topOffset: null,
            hex: null,
            options: [
                {
                    color: CONSTANTS.COLORS.BLUE,
                    hex: "#0974b7",
                    topOffset: 5,
                },
                {
                    color: CONSTANTS.COLORS.GREEN,
                    hex: "#85c042",
                    topOffset: 35,
                },
                {
                    color: CONSTANTS.COLORS.RED,
                    hex: "#db3a25",
                    topOffset: 65,
                },
                {
                    color: CONSTANTS.COLORS.YELLOW,
                    hex: "#fed439",
                    topOffset: 95,
                }
            ],
             
        }
    });
}


export function resetListOfMatchesScreenData() {
    listOfMatchesScreenData.set({
        isFetching: false,
        matches: [],
    });
}

function setIsFetchingMatchesFlag(flag) {
    listOfMatchesScreenData.update(value => {
        value.isFetching = flag;
        return value;
    });
}


export function switchScreen(value) {
    screen.set(value)
};


export function getAvailableMatches() {
    setIsFetchingMatchesFlag(true);
    get(socketIO).emit("getAvailableMatches", (list) => {
        listOfMatchesScreenData.update((data) => {
            data.matches = list;
            setIsFetchingMatchesFlag(false);
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
                Object.assign(value.wildColor, {
                    isVisible: false,
                    color: null,
                    topOffset: null,
                    hex: null,
                });
                return value;
            });
        }
        else {
            gameScreenData.update(value => {
                value.selectedCardIndex = index;
                Object.assign(value.wildColor, {
                    isVisible: get(gameScreenData).player.cards[index].color == CONSTANTS.COLORS.WILD,
                    color: null,
                    topOffset: null,
                    hex: null,
                });
                return value;
            });
        }
    }
    else {
        setAlert(CONSTANTS.ALERT_TYPE.INFO, "To play a card wait for your turn.", 3000);
    }
}

export function playCard() {
    if (get(gameScreenData).selectedCardIndex === null) {
        setAlert(CONSTANTS.ALERT_TYPE.INFO, "To confirm action, select a card.", 3000);
        return;
    }
    
    if (get(gameScreenData).player.cards[get(gameScreenData).selectedCardIndex].color == CONSTANTS.COLORS.WILD && get(gameScreenData).wildColor.color == null) {
        setAlert(CONSTANTS.ALERT_TYPE.INFO, `To confirm action, select a color.`, 3000);
        return;
    }

    get(socketIO).emit("playCard", get(gameScreenData).matchID, get(gameScreenData).selectedCardIndex, get(gameScreenData).wildColor.color, (response) => {
        console.log("playCard (result):", response.result);
        if (response.result === false) {
            console.log("playCard (reason):", response.reason);
            setAlert(CONSTANTS.ALERT_TYPE.INFO, `Action failed: <br> ${response.reason}`, 5000);
        }
        else {
            gameScreenData.update(value => {
                value.selectedCardIndex = null;
                Object.assign(value.wildColor, {
                    isVisible: false,
                    color: null,
                    topOffset: null,
                    hex: null,
                });
                return value;
            });
        }
    });
}


export function drawCard() {
    get(socketIO).emit("drawCard", get(gameScreenData).matchID, (response) => {
        console.log("drawCard (result):", response.result);
        if (response.result === false) {
            console.log("drawCard (reason):", response.reason);
            setAlert(CONSTANTS.ALERT_TYPE.INFO, `Action failed: <br> ${response.reason}`, 5000);
        }
        else {
            gameScreenData.update(value => {
                value.selectedCardIndex = null;
                Object.assign(value.wildColor, {
                    isVisible: false,
                    color: null,
                    topOffset: null,
                    hex: null,
                });
                return value;
            });
        }
    });
}


export function changeWildColorOption(option) {
    console.log(option);
    gameScreenData.update(value => {
        value.wildColor.color = option.color,
        value.wildColor.topOffset = option.topOffset;
        value.wildColor.hex = option.hex;
        return value;
    })
}


export function getPlayerName(socketId) {
    console.log(get(gameScreenData).match.players);
    const list = get(gameScreenData).match.players.filter(player => player.id === socketId);
    console.log("list", list);
    if(list.length)
        return list[0];
    else
        return null;
}