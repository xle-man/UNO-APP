const CONSTANTS = require("./constants");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function compareCards(pileCard, cardToPlay, wildColor) {
  if (cardToPlay.color == CONSTANTS.COLORS.WILD) {
    return true;
  } else if (cardToPlay.color == pileCard.color) {
    return true;
  } else if (cardToPlay.symbol == pileCard.symbol) {
    return true;
  } else if (
    pileCard.color == CONSTANTS.COLORS.WILD &&
    cardToPlay.color == wildColor
  ) {
    return true;
  } else {
    return false;
  }
}

function getIndexOfPlayer(socketId, players) {
  for (let i = 0; i < players.length; i++) {
    if (socketId == players[i].socketId) return i;
  }
  return -1;
}

module.exports = { shuffleArray, compareCards, getIndexOfPlayer };
