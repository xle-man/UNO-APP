const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const db = require("./javascript/firebase");
const CONSTANTS = require("./javascript/constants");
const {
  shuffleArray,
  compareCards,
  getIndexOfPlayer,
} = require("./javascript/api");
const {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  deleteDoc,
} = require("firebase/firestore");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ----- Socket ----- //
io.on("connection", (socket) => {
  const matchesRef = collection(db, "matches");
  console.log(`New client joined: ${socket.id}`);

  // function to refresh list for every client in ListOfMatchesScreen
  const updateAvailableMatches = async () => {
    const listOfAvaiableMatches = await getDocs(matchesRef).then((snap) => {
      const list = [];
      snap.docs.map((doc) => {
        const data = doc.data();
        if (data.state === CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS) {
          list.push({
            id: doc.id,
            players: data.players.map((player) => {
              return { name: player.name };
            }),
            requiredAmountOfPlayers: data.requiredAmountOfPlayers,
          });
        }
      });

      return list;
    });

    io.emit("updateAvailableMatches", listOfAvaiableMatches);
  };

  socket.on(
    "createGame",
    async (playerName, requiredAmountOfPlayers, callback) => {
      const players = [];
      players.push({ name: playerName, socketId: socket.id });
      console.log(
        "createGame:",
        playerName,
        socket.id,
        requiredAmountOfPlayers
      );

      const docRef = await addDoc(matchesRef, {
        state: CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS,
        requiredAmountOfPlayers,
        players,
      });
      updateAvailableMatches();

      const dataToSend = {
        result: true,
        data: {
          id: docRef.id,
          players: players.map((player) => {
            return { name: player.name };
          }),
          requiredAmountOfPlayers,
        },
      };

      // prepared data sending to client [remember the security of private data]
      callback(dataToSend);
    }
  );

  socket.on("getAvailableMatches", async (callback) => {
    const listOfAvaiableMatches = await getDocs(matchesRef).then((snap) => {
      const list = [];
      snap.docs.map((doc) => {
        const data = doc.data();
        if (data.state === CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS) {
          list.push({
            id: doc.id,
            players: data.players.map((player) => {
              return { name: player.name };
            }),
            requiredAmountOfPlayers: data.requiredAmountOfPlayers,
          });
        }
      });

      return list;
    });

    // prepared data sending to client [remember the security of private data]
    callback(listOfAvaiableMatches);
  });

  socket.on("joinToGame", async (playerName, matchID, callback) => {
    const docRef = doc(db, "matches", matchID);
    let match = await getDoc(docRef).then((snap) => snap.data());

    if (match.players.length == match.requiredAmountOfPlayers) {
      const dataToSend = {
        result: false,
        data: {},
      };

      callback(dataToSend);
      return;
    }

    const updatedPlayersList = match.players.concat({
      socketId: socket.id,
      name: playerName,
    });

    console.log("Players: ", updatedPlayersList);

    match.players = updatedPlayersList;
    await updateDoc(docRef, {
      players: updatedPlayersList,
    });
    updateAvailableMatches();

    // prepared data sending to client [remember the security of private data]
    const data = {
      id: docRef.id,
      players: updatedPlayersList.map((player) => {
        return { name: player.name };
      }),
      requiredAmountOfPlayers: match.requiredAmountOfPlayers,
    };
    const dataToSend = {
      result: true,
      data: data,
    };

    callback(dataToSend);

    updatedPlayersList.forEach((player) => {
      io.to(player.socketId).emit("updateWaitingForGameData", data);
    });

    if (updatedPlayersList.length == match.requiredAmountOfPlayers) {
      match.state = CONSTANTS.GAME_STATES.ACTIVE;
      await updateDoc(docRef, {
        state: CONSTANTS.GAME_STATES.ACTIVE,
      });
      updateAvailableMatches();

      let availableCards = shuffleArray(
        JSON.parse(JSON.stringify(CONSTANTS.CARDS))
      );

      updatedPlayersList.forEach((player) => {
        Object.assign(player, { cards: [] });
      });

      for (let i = 0; i < 7; i++) {
        updatedPlayersList.forEach((player) => {
          player.cards.push(availableCards.shift());
        });
      }

      //choose first card
      const firstCard = availableCards.filter((el) => !el.isSpecial).shift();
      availableCards = availableCards.filter((el) => el.src !== firstCard.src);

      await updateDoc(docRef, {
        players: updatedPlayersList,
        activePlayer: updatedPlayersList[0].socketId,
        availableCards: availableCards,
        playedCards: [firstCard],
        order: CONSTANTS.ORDER.CLOCKWISE,
        winner: null,
        wildColor: null,
      });

      match = await getDoc(docRef).then((snap) => snap.data());

      // prepared data sending to client [remember the security of private data]
      const initData = {
        matchID: matchID,
        activePlayer: match.activePlayer,
        amountOfAvailableCards: match.availableCards.length,
        players: updatedPlayersList.map((player) => {
          return {
            id: player.socketId,
            name: player.name,
            amountOfCards: player.cards.length,
          };
        }),
        playedCards: [firstCard],
      };

      updatedPlayersList.forEach((player) => {
        const initDataToSend = Object.assign(initData, {
          player: {
            id: player.socketId,
            cards: player.cards,
            amountOfCards: player.cards.length,
          },
        });

        console.log(`${player.name}'s data to send:`, initDataToSend);

        try {
          io.to(player.socketId).emit("startGame", initDataToSend);
        } catch (error) {
          console.log("Error while emitting startGame event:", error);
        }
      });
    }
  });

  socket.on("quitMatch", async (matchID) => {
    const docRef = doc(db, "matches", matchID);
    let match = await getDoc(docRef).then((snap) => snap.data());

    const updatedPlayersList = match.players.filter(
      (player) => player.socketId != socket.id
    );
    console.log("quitMatch (updated list of players):", updatedPlayersList);

    if (updatedPlayersList.length) {
      await updateDoc(docRef, {
        players: updatedPlayersList,
      });

      updateAvailableMatches();

      // prepared data sending to client [remember the security of private data]
      const dataToSend = {
        id: `docRef`.id,
        players: updatedPlayersList.map((player) => {
          return { name: player.name };
        }),
        requiredAmountOfPlayers: match.requiredAmountOfPlayers,
      };

      updatedPlayersList.forEach((player) => {
        io.to(player.socketId).emit("updateWaitingForGameData", dataToSend);
      });
    } else {
      await deleteDoc(docRef);
      updateAvailableMatches();
    }
  });

  socket.on(
    "playCard",
    async (matchID, selectedCardIndex, wildColor, callback) => {
      // getting match data from datastore
      const docRef = doc(db, "matches", matchID);
      let match = await getDoc(docRef).then((snap) => snap.data());

      const indexOfPlayer = getIndexOfPlayer(socket.id, match.players);
      const player = match.players[indexOfPlayer];
      const cardToPlay = player.cards[selectedCardIndex];

      // checking if the player is playing a turn
      if (match.activePlayer != socket.id) {
        const dataToSend = {
          result: false,
          reason: "It isn't your turn!",
        };

        callback(dataToSend);
        return;
      }

      // checking if the card can be played
      if (!compareCards(match.playedCards[0], cardToPlay, match.wildColor)) {
        const dataToSend = {
          result: false,
          reason: "Selected card doesn't match.",
        };

        callback(dataToSend);
        return;
      }

      // handling of played card
      match.playedCards.unshift(cardToPlay);
      player.cards.splice(selectedCardIndex, 1);

      // handling end of availableCards
      if (match.availableCards.length === 0) {
        const lastCard = match.playedCards.shift();
        match.availableCards = shuffleArray(match.playedCards);
        match.playedCards = [lastCard];
      }

      // reset wild color from previous turn (not always needed)
      match.wildColor = null;

      // handling special effects od cards
      if (cardToPlay.isSpecial) {
        if (cardToPlay.symbol == CONSTANTS.SYMBOL.REVERSE) {
          match.order =
            match.order == CONSTANTS.ORDER.CLOCKWISE
              ? CONSTANTS.ORDER.COUNTERCLOCKWISE
              : CONSTANTS.ORDER.CLOCKWISE;
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.SKIP) {
          const indexOfActivePlayer = getIndexOfPlayer(
            match.activePlayer,
            match.players
          );
          let indexOfNextActivePlayer = null;
          if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
            if (indexOfActivePlayer == match.players.length - 1)
              indexOfNextActivePlayer = 0;
            else indexOfNextActivePlayer = indexOfActivePlayer + 1;
          } else {
            if (indexOfActivePlayer == 0)
              indexOfNextActivePlayer = match.players.length - 1;
            else indexOfNextActivePlayer = indexOfActivePlayer - 1;
          }
          match.activePlayer = match.players[indexOfNextActivePlayer].socketId;
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.DRAW2) {
          const indexOfActivePlayer = getIndexOfPlayer(
            match.activePlayer,
            match.players
          );
          let indexOfNextActivePlayer = null;
          if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
            if (indexOfActivePlayer == match.players.length - 1)
              indexOfNextActivePlayer = 0;
            else indexOfNextActivePlayer = indexOfActivePlayer + 1;
          } else {
            if (indexOfActivePlayer == 0)
              indexOfNextActivePlayer = match.players.length - 1;
            else indexOfNextActivePlayer = indexOfActivePlayer - 1;
          }
          match.activePlayer = match.players[indexOfNextActivePlayer].socketId;

          // get cards to next player
          if (
            match.availableCards.length <= 2 &&
            match.availableCards.length > 0
          ) {
            for (let i = 0; i <= match.availableCards.length; i++) {
              match.players[indexOfNextActivePlayer].cards.push(
                match.availableCards.shift()
              );
            }
          }
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.CHANGE_COLOR) {
          match.wildColor = wildColor;
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.DRAW4) {
          const indexOfActivePlayer = getIndexOfPlayer(
            match.activePlayer,
            match.players
          );
          let indexOfNextActivePlayer = null;
          if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
            if (indexOfActivePlayer == match.players.length - 1)
              indexOfNextActivePlayer = 0;
            else indexOfNextActivePlayer = indexOfActivePlayer + 1;
          } else {
            if (indexOfActivePlayer == 0)
              indexOfNextActivePlayer = match.players.length - 1;
            else indexOfNextActivePlayer = indexOfActivePlayer - 1;
          }
          match.activePlayer = match.players[indexOfNextActivePlayer].socketId;

          // get cards to next player
          if (
            match.availableCards.length <= 4 &&
            match.availableCards.length > 0
          ) {
            for (let i = 0; i <= match.availableCards.length; i++) {
              match.players[indexOfNextActivePlayer].cards.push(
                match.availableCards.shift()
              );
            }
          }
          match.wildColor = wildColor;
        }
      }

      // changing of active player
      const indexOfActivePlayer = getIndexOfPlayer(
        match.activePlayer,
        match.players
      );
      let indexOfNextActivePlayer = null;
      if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
        if (indexOfActivePlayer == match.players.length - 1)
          indexOfNextActivePlayer = 0;
        else indexOfNextActivePlayer = indexOfActivePlayer + 1;
      } else {
        if (indexOfActivePlayer == 0)
          indexOfNextActivePlayer = match.players.length - 1;
        else indexOfNextActivePlayer = indexOfActivePlayer - 1;
      }
      match.activePlayer = match.players[indexOfNextActivePlayer].socketId;

      //check winner

      // updating of match in datastore
      await updateDoc(docRef, match);

      // prepared data sending to client [remember the security of private data]
      const updatedGameData = {
        activePlayer: match.activePlayer,
        amountOfAvailableCards: match.availableCards.length,
        players: match.players.map((player) => {
          return {
            id: player.socketId,
            name: player.name,
            amountOfCards: player.cards.length,
          };
        }),
        playedCards: match.playedCards,
        wildColor: match.wildColor,
        order: match.order,
      };

      // emitting of event "updateGameData" to each player in match
      match.players.forEach((player) => {
        const updatedGameDataToSend = Object.assign(updatedGameData, {
          player: {
            id: player.socketId,
            cards: player.cards,
            amountOfCards: player.cards.length,
          },
        });

        // console.log(
        //   `${player.name}'s updated gameData to send:`,
        //   updatedGameDataToSend
        // );

        try {
          io.to(player.socketId).emit("updateGameData", updatedGameDataToSend);
        } catch (error) {
          console.log("Error while emitting startGame event:", error);
        }
      });

      // preparing result data as success and calling the callback
      const dataToSend = {
        result: true,
        reason: "",
      };

      callback(dataToSend);
    }
  );

  socket.on("drawCard", async (matchID, callback) => {
    // getting match data from datastore
    const docRef = doc(db, "matches", matchID);
    let match = await getDoc(docRef).then((snap) => snap.data());

    const indexOfPlayer = getIndexOfPlayer(socket.id, match.players);
    const player = match.players[indexOfPlayer];

    // checking if the player is playing a turn
    if (match.activePlayer != socket.id) {
      const dataToSend = {
        result: false,
        reason: "It isn't your turn!",
      };

      callback(dataToSend);
      return;
    }

    // handling of played card
    if (match.availableCards.length > 0) {
      player.cards.push(match.availableCards.shift());
    } else {
      if (match.playedCards.length > 1) {
        const lastCard = match.playedCards.shift();
        match.availableCards = shuffleArray(match.playedCards);
        player.cards.push(match.availableCards.shift());
        match.playedCards = [lastCard];
      } else {
        const dataToSend = {
          result: false,
          reason: "There is no available cards!",
        };

        callback(dataToSend);
        return;
      }
    }

    // changing of active player
    const indexOfActivePlayer = getIndexOfPlayer(
      match.activePlayer,
      match.players
    );
    let indexOfNextActivePlayer = null;
    if (match.order == CONSTANTS.ORDER.CLOCKWISE) {
      if (indexOfActivePlayer == match.players.length - 1)
        indexOfNextActivePlayer = 0;
      else indexOfNextActivePlayer = indexOfActivePlayer + 1;
    } else {
      if (indexOfActivePlayer == 0)
        indexOfNextActivePlayer = match.players.length - 1;
      else indexOfNextActivePlayer = indexOfActivePlayer - 1;
    }
    match.activePlayer = match.players[indexOfNextActivePlayer].socketId;

    // updating of match in datastore
    await updateDoc(docRef, match);

    // prepared data sending to client [remember the security of private data]
    const updatedGameData = {
      activePlayer: match.activePlayer,
      amountOfAvailableCards: match.availableCards.length,
      players: match.players.map((player) => {
        return {
          id: player.socketId,
          name: player.name,
          amountOfCards: player.cards.length,
        };
      }),
      playedCards: match.playedCards,
      wildColor: match.wildColor,
      order: match.order,
    };

    // emitting of event "updateGameData" to each player in match
    match.players.forEach((player) => {
      const updatedGameDataToSend = Object.assign(updatedGameData, {
        player: {
          id: player.socketId,
          cards: player.cards,
          amountOfCards: player.cards.length,
        },
      });

      // console.log(
      //   `${player.name}'s updated gameData to send:`,
      //   updatedGameDataToSend
      // );

      try {
        io.to(player.socketId).emit("updateGameData", updatedGameDataToSend);
      } catch (error) {
        console.log("Error while emitting startGame event:", error);
      }
    });

    // preparing result data as success and calling the callback
    const dataToSend = {
      result: true,
      reason: "",
    };

    callback(dataToSend);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconneted: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ----- TODO ----- //
// dodać odświeżanie talii kart po wyczerpani się stosu dobierania zarówno w playCard jak i w drawCard
// dodać obsługę disconnect z clientem
// dodać mechanikę zgłaszania UNO
