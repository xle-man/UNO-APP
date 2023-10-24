// const SERVER_URL = "http://localhost:3000";
const SERVER_URL = "http://192.168.71.142:3000";


const SCREEN = {
    MAIN_SCREEN: "",
    GAME_SCREEN: "game",
    WAITING_FOR_GAME_SCREEN: "waitingForGame",
    LIST_OF_MATCHES: "listOfMatches",
}
Object.freeze(SCREEN);


const TYPE_OF_GAME_SELECTION = {
    CREATE: "CREATE",
    JOIN: "JOIN"
}
Object.freeze(TYPE_OF_GAME_SELECTION);


const ALERT_TYPES = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
}
Object.freeze(ALERT_TYPES);


export default {
    SERVER_URL,
    SCREEN,
    TYPE_OF_GAME_SELECTION,
    ALERT_TYPES,
}