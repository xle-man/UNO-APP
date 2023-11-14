const GAME_STATES = {
  FINISHED: "FINISHED",
  WAITING_FOR_PLAYERS: "WAITING_FOR_PLAYERS",
  ACTIVE: "ACTIVE",
};
Object.freeze(GAME_STATES);

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

const SYMBOL = {
  SKIP: "SKIP",
  REVERSE: "REVERSE",
  DRAW2: "DRAW2",
  CHANGE_COLOR: "CHANGE_COLOR",
  DRAW4: "DRAW4",
}
Object.freeze(SYMBOL);

const generateCards = (color) =>{
  let output = [];
  for (let i = 0; i < 10; i++){
    output.push({color: color, isSpecial: false, symbol: i});
  }
  for (const [key, value] of Object.entries(SYMBOL)) {
    if (value === "CHANGE_COLOR" || value === "DRAW4") {
      output.push({color: COLORS.WILD,isSpecial: true, symbol: value})
    }else{
      output.push({color: color, isSpecial: true, symbol: value});
    }
  }

  return output;
}

const CARDS = [
  ...generateCards("RED"),
  ...generateCards("YELLOW"),
  ...generateCards("GREEN"),
  ...generateCards("BLUE"),
];
Object.freeze(CARDS);

module.exports = { GAME_STATES, ORDER, CARDS, COLORS };
