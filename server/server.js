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
  changeActivePlayer,
  getCardsToNextPlayer,
  callbackToClient,
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
const { constants } = require("buffer");

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
  console.log(`New client joined: ${socket.id}`);

  const matchesRef = collection(db, "matches");

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

      const docRef = await addDoc(matchesRef, {
        state: CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS,
        requiredAmountOfPlayers,
        players,
      });
      updateAvailableMatches();

      const dataToSend = {
        id: docRef.id,
        players: players.map((player) => {
          return { name: player.name };
        }),
        requiredAmountOfPlayers,
      };

      // prepared data sending to client [remember the security of private data]
      callbackToClient(true, "", dataToSend, callback);
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
      callbackToClient(false, "", {}, callback);
      return;
    }

    const updatedPlayersList = match.players.concat({
      socketId: socket.id,
      name: playerName,
    });

    match.players = updatedPlayersList;
    await updateDoc(docRef, {
      players: updatedPlayersList,
    });
    updateAvailableMatches();

    // prepared data sending to client [remember the security of private data]
    const dataToSend = {
      id: docRef.id,
      players: updatedPlayersList.map((player) => {
        return { name: player.name };
      }),
      requiredAmountOfPlayers: match.requiredAmountOfPlayers,
    };
    callbackToClient(true, "", dataToSend, callback);

    updatedPlayersList.forEach((player) => {
      io.to(player.socketId).emit("updateWaitingForGameData", dataToSend);
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
        Object.assign(player, { cards: [], afk: false });
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
        state: CONSTANTS.GAME_STATES.ACTIVE,
      };

      updatedPlayersList.forEach((player) => {
        const initDataToSend = Object.assign(initData, {
          player: {
            id: player.socketId,
            cards: player.cards,
            amountOfCards: player.cards.length,
          },
        });

        console.log("startGame", match.state);
        // console.log("players", match.players);

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
        callbackToClient(false, "It isn't your turn!", null, callback);
        return;
      }

      // checking if the card can be played
      if (!compareCards(match.playedCards[0], cardToPlay, match.wildColor)) {
        callbackToClient(false, "Selected card doesn't match.", null, callback);
        return;
      }

      if (
        cardToPlay.symbol === CONSTANTS.SYMBOL.DRAW2 &&
        match.availableCards.length + match.playedCards.length - 1 < 2
      ) {
        callbackToClient(false, "There is no available cards!", null, callback);
        return;
      } else if (
        cardToPlay.symbol === CONSTANTS.SYMBOL.DRAW4 &&
        match.availableCards.length + match.playedCards.length - 1 < 4
      ) {
        callbackToClient(false, "There is no available cards!", null, callback);
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
          changeActivePlayer(match);
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.DRAW2) {
          const indexOfNextActivePlayer = changeActivePlayer(match);

          // get cards to next player
          getCardsToNextPlayer(match, indexOfNextActivePlayer, 2);
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.CHANGE_COLOR) {
          match.wildColor = wildColor;
        } else if (cardToPlay.symbol == CONSTANTS.SYMBOL.DRAW4) {
          const indexOfNextActivePlayer = changeActivePlayer(match);

          // get cards to next player
          getCardsToNextPlayer(match, indexOfNextActivePlayer, 4);

          //change color
          match.wildColor = wildColor;
        }
      }

      // changing of active player
      changeActivePlayer(match);

      //check winner
      if (player.cards.length === 0) {
        match.winner = player.socketId;
        match.state = CONSTANTS.GAME_STATES.FINISHED;
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, match);
      }

      // updating of match in datastore

      // prepared data sending to client [remember the security of private data]
      const updatedGameData = {
        activePlayer: match.activePlayer,
        amountOfAvailableCards: match.availableCards.length,
        players: match.players.map((player) => {
          return {
            id: player.socketId,
            name: player.name,
            amountOfCards: player.cards.length,
            afk: player.afk,
          };
        }),
        playedCards: match.playedCards,
        wildColor: match.wildColor,
        order: match.order,
        winner: match.winner,
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

        try {
          io.to(player.socketId).emit("updateGameData", updatedGameDataToSend);
        } catch (error) {
          console.log("Error while emitting startGame event:", error);
        }
      });

      // preparing result data as success and calling the callback
      callbackToClient(true, "", null, callback);
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
      callbackToClient(false, "It isn't your turn!", null, callback);
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
        callbackToClient(false, "There is no available cards!", null, callback);
        return;
      }
    }

    // changing of active player
    changeActivePlayer(match);

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

      try {
        io.to(player.socketId).emit("updateGameData", updatedGameDataToSend);
      } catch (error) {
        console.log("Error while emitting startGame event:", error);
      }
    });

    // preparing result data as success and calling the callback
    callbackToClient(true, "", null, callback);
  });

  socket.on("disconnect", async () => {
    console.log(`Client disconneted: ${socket.id}`);

    const matchesRef = collection(db, "matches");
    let matchID = "";
    let match = null;

    //update player afk to true && get matchID
    await getDocs(matchesRef).then((snap) => {
      snap.docs.map((doc) => {
        const data = doc.data();

        data.players.map((player) => {
          if (player.socketId === socket.id) {
            player.afk = true;
            matchID = doc.id;
            match = data;
            return;
          }
        });
      });
    });

    //update of match in firestore
    if (matchID && match) {
      console.log("disconnect", match.state, matchID);
      let docRef = doc(db, "matches", matchID);

      if (match.state == CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS) {
        const updatedPlayersList = match.players.filter(
          (player) => player.socketId != socket.id
        );

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
      } else if (match.state == CONSTANTS.GAME_STATES.ACTIVE) {
        console.log("other players", match.players);

        changeActivePlayer(match);
        const activePlayers = match.players.filter((el) => !el.afk);

        if (activePlayers.length < 2) {
          console.log("set Finished");
          match.state = CONSTANTS.GAME_STATES.FINISHED;
          match.winner = activePlayers[0].socketId;
          await deleteDoc(docRef);
        } else {
          //update match in firebase
          await updateDoc(docRef, match);
        }

        const updatedGameData = {
          activePlayer: match.activePlayer,
          amountOfAvailableCards: match.availableCards.length,
          players: match.players.map((player) => {
            return {
              id: player.socketId,
              name: player.name,
              amountOfCards: player.cards.length,
              afk: player.afk,
            };
          }),
          playedCards: match.playedCards,
          wildColor: match.wildColor,
          order: match.order,
          winner: match.winner,
          state: match.state,
        };

        // emitting of event "updateGameData" to each player in match
        match.players.forEach((player) => {
          if (player.socketId !== socket.id) {
            const updatedGameDataToSend = Object.assign(updatedGameData, {
              player: {
                id: player.socketId,
                cards: player.cards,
                amountOfCards: player.cards.length,
                afk: player.afk,
              },
            });

            try {
              io.to(player.socketId).emit(
                "updateGameData",
                updatedGameDataToSend
              );
            } catch (error) {
              console.log("Error while emitting startGame event:", error);
            }
          }
        });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ----- TODO ----- //
// dodać obsługę disconnect z clientem
// dodać mechanikę zgłaszania UNO
