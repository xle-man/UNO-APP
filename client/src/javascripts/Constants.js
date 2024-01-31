const SERVER_URL = "http://localhost:3000";
// const SERVER_URL = "http://192.168.71.142:3000";


const SCREEN = {
    MAIN_SCREEN: "MAIN_SCREEN",
    GAME_SCREEN: "GAME_SCREEN",
    WAITING_FOR_GAME_SCREEN: "WAITING_FOR_GAME_SCREEN",
    LIST_OF_MATCHES: "LIST_OF_MATCHES",
}
Object.freeze(SCREEN);


const TYPE_OF_GAME_SELECTION = {
    CREATE: "CREATE",
    JOIN: "JOIN"
}
Object.freeze(TYPE_OF_GAME_SELECTION);


const ALERT_TYPE = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
}
Object.freeze(ALERT_TYPE);


const GAME_STATE = {
    FINISHED: "FINISHED",
    WAITING_FOR_PLAYERS: "WAITING_FOR_PLAYERS",
    ACTIVE: "ACTIVE"
}
Object.freeze(GAME_STATE);


const ORDER = {
    CLOCKWISE: "CLOCKWISE",
    COUNTERCLOCKWISE: "COUNTERCLOCKWISE"
}
Object.freeze(ORDER);


const COLORS = {
    RED: "RED",
    YELLOW: "YELLOW",
    GREEN: "GREEN",
    BLUE: "BLUE",
    WILD: "WILD"
  }
  Object.freeze(COLORS);


export default {
    SERVER_URL,
    SCREEN,
    TYPE_OF_GAME_SELECTION,
    ALERT_TYPE,
    GAME_STATE,
    ORDER,
    COLORS,
}