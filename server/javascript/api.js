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

function changeActivePlayer(match) {
  const indexOfActivePlayer = getIndexOfPlayer(
    match.activePlayer,
    match.players
  );

  let indexOfNextActivePlayer = indexOfActivePlayer;

  if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
    do {
      if (indexOfNextActivePlayer == match.players.length - 1)
        indexOfNextActivePlayer = 0;
      else indexOfNextActivePlayer++;
    } while (match.players[indexOfNextActivePlayer].afk);
  } else {
    do {
      if (indexOfNextActivePlayer == 0)
        indexOfNextActivePlayer = match.players.length - 1;
      else indexOfNextActivePlayer--;
    } while (match.players[indexOfNextActivePlayer].afk);
  }

  match.activePlayer = match.players[indexOfNextActivePlayer].socketId;
  // console.log("activePlayer", match.players[indexOfNextActivePlayer].name);
  return indexOfNextActivePlayer;
}

function getCardsToNextPlayer(match, indexOfNextActivePlayer, amount) {
  for (let i = 0; i < amount; i++) {
    if (match.availableCards.length === 0) {
      const lastCard = match.playedCards.shift();
      match.availableCards = shuffleArray(match.playedCards);
      match.playedCards = [lastCard];
    }
    match.players[indexOfNextActivePlayer].cards.push(
      match.availableCards.shift()
    );
  }
}

function callbackToClient(result, reason, data, callback) {
  callback({ result, reason, data });
}

module.exports = {
  shuffleArray,
  compareCards,
  getIndexOfPlayer,
  changeActivePlayer,
  getCardsToNextPlayer,
  callbackToClient,
};
