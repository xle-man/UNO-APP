const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");

const db = require("./javascript/firebase");
const CONSTANTS = require("./javascript/constants");
const { collection, getDocs, addDoc, updateDoc, getDoc, doc, deleteDoc } = require("firebase/firestore");
const { constants } = require("buffer");

const PORT = process.env.PORT || 3000;
let order;
let discardPile = [];
let currentPlayer = 0;
let players = [];
let playerCards = [];

const app = express();
let drawPile = [];
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get("/", (req, res) => {
  res.send("Hello World! Test");
});
let id;

function distributeCards(updatedPlayersList) {
  updatedPlayersList.forEach((player) => {
    let cards = [];
    for (let i = 0; i < 7; i++) {
      cards.push(drawPile[0])
      drawPile.splice(0, 1);
    }
    playerCards.push(cards);
  })
  console.log(drawPile);
}

function nextPlayer() {
  currentPlayer += order;
  if (currentPlayer >= players.length) currentPlayer = 0;
  else if (currentPlayer < 0) currentPlayer = players.length - 1;
}

function sendCardsToPlayers(updatedPlayersList) {
  updatedPlayersList.forEach((player, ind) => {
    io.to(player.socketId).emit("getCards", playerCards[ind], discardPile[0])
  })
  console.log(drawPile);
}

function getPlayerIndex(playerName) {
  let index = -1;
  console.log("Player name: ", playerName)
  players.forEach((player => {
    if (player.name == playerName) {
      index = players.indexOf(player);
    }
  }))
  console.log(index);
  return (index);

}


io.on("connection", (socket) => {
  const matchesRef = collection(db, "matches");
  console.log(`New client joined: ${socket.id}`);


  socket.on("createGame", async (playerName, requiredAmountOfPlayers, callback) => {
    const players = [];
    players.push({ name: playerName, socketId: socket.id });
    console.log("createGame:", playerName, socket.id, requiredAmountOfPlayers);

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
        players: players.map((player) => { return { name: player.name } }),
        requiredAmountOfPlayers
      }
    };

    // prepared data sending to client [remember the security of private data]
    callback(dataToSend);

  });


  socket.on("getAvailableMatches", async (callback) => {
    const listOfAvaiableMatches = await getDocs(matchesRef).then((snap) => {
      const list = [];
      snap.docs.map((doc) => {
        const data = doc.data();
        if (data.state === CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS) {
          list.push({
            id: doc.id,
            players: data.players.map((player) => { return { name: player.name } }),
            requiredAmountOfPlayers: data.requiredAmountOfPlayers
          });
        }
      });

      return list;
    });

    // prepared data sending to client [remember the security of private data]
    callback(listOfAvaiableMatches);
  });

  socket.on("requestTurn", async (playerName, card, callback) => {
    console.log("joł")
    let index = getPlayerIndex(playerName);
    if (index == currentPlayer) {
      if (discardPile[0].color == card.color || discardPile[0].symbol == card.symbol) {
        console.log("siuu")
        console.log(card);
        console.log(playerCards[index]);
        let cardIndex = -1
        for (let i = 0; i < playerCards[index].length; i++) {
          console.log(playerCards[index][i]);
          if (card.color == playerCards[index][i].color && card.symbol == playerCards[index][i].symbol) {
            cardIndex = i;
          }
        }

        console.log(cardIndex)
        playerCards[index].splice(cardIndex, 1);
        discardPile.splice(0, 0, card);
        sendCardsToPlayers(players);

        if (card.symbol == CONSTANTS.SYMBOL.REVERSE) {
          order *= -1;
        }
        if (card.symbol != CONSTANTS.SYMBOL.REVERSE || players.length > 2) {
          nextPlayer();


        }
        callback(true, discardPile[0], playerCards[index]);

      }
      else {
        console.log("bruh")
        callback(false);
      }
    }
    else {
      console.log("")
      callback(false);
    }
  });

  socket.on("drawCard", async (playerName, callback) => {
    console.log("joł")
    let index = getPlayerIndex(playerName);
    if (index == currentPlayer) {
      playerCards[index].push(drawPile[0]);
      drawPile.splice(0, 1);
      nextPlayer();
      callback(true, playerCards[index]);
      

    }
    else {
      console.log("")
      callback(false);
    }
  });


  // refreshing list for every client in ListOfMatchesScreen
  const updateAvailableMatches = async () => {
    const listOfAvaiableMatches = await getDocs(matchesRef).then((snap) => {
      const list = [];
      snap.docs.map((doc) => {
        const data = doc.data();
        if (data.state === CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS) {
          list.push({
            id: doc.id,
            players: data.players.map((player) => { return { name: player.name } }),
            requiredAmountOfPlayers: data.requiredAmountOfPlayers
          });
        }
      });

      return list;
    });

    io.emit("updateAvailableMatches", listOfAvaiableMatches);
  };


  socket.on("joinToGame", async (playerName, matchID, callback) => {
    id = matchID;
    const docRef = doc(db, "matches", matchID);
    let match = await getDoc(docRef).then(snap => snap.data());

    if (match.players.length == match.requiredAmountOfPlayers) {
      const dataToSend = {
        result: false,
        data: {}
      };

      callback(dataToSend);
      return;
    }

    const updatedPlayersList = match.players.concat({
      name: playerName,
      socketId: socket.id
    });
    players = updatedPlayersList;
    console.log(players)

    console.log("Players: ", updatedPlayersList);



    await updateDoc(docRef, {
      players: updatedPlayersList
    });
    updateAvailableMatches();

    // prepared data sending to client [remember the security of private data]
    const data = {
      id: docRef.id,
      players: updatedPlayersList.map((player) => { return { name: player.name } }),
      requiredAmountOfPlayers: match.requiredAmountOfPlayers
    };
    const dataToSend = {
      result: true,
      data: data
    };

    callback(dataToSend);


    updatedPlayersList.forEach((player) => {
      io.to(player.socketId).emit("updateWaitingForGameData", data);
    });
    if (updatedPlayersList.length == match.requiredAmountOfPlayers) {
      updatedPlayersList.forEach((player) => {
        console.log(player);
        try {
          io.to(player.socketId).emit("startGame");

        }
        catch (error) {
          console.log('Error while emitting startGame event:', error);
        }

      });
      await updateDoc(docRef, {
        state: CONSTANTS.GAME_STATES.ACTIVE
      });
      let temp = CONSTANTS.CARDS;
      drawPile = shuffleArray([...temp])
      order = 1;
      while (true) {
        if (drawPile[0].color != CONSTANTS.COLORS.WILD) {
          discardPile.push(drawPile[0])
          drawPile.splice(0, 1);
          break;
        }
        else {
          drawPile.push(drawPile[0])
          drawPile.splice(0, 1);
        }
      }

      console.log("Center: ", discardPile)


      currentPlayer = 0;
      distributeCards(updatedPlayersList);
      sendCardsToPlayers(updatedPlayersList);


    }

  });







  socket.on("quitMatch", async (matchID) => {
    const docRef = doc(db, "matches", matchID);
    let match = await getDoc(docRef).then(snap => snap.data());

    const updatedPlayersList = match.players.filter(player => player.socketId != socket.id);
    console.log("quitMatch (updated list of players):", updatedPlayersList);

    if (updatedPlayersList.length) {
      await updateDoc(docRef, {
        players: updatedPlayersList
      });

      updateAvailableMatches();

      // prepared data sending to client [remember the security of private data]
      const dataToSend = {
        id: `docRef`.id,
        players: updatedPlayersList.map((player) => { return { name: player.name } }),
        requiredAmountOfPlayers: match.requiredAmountOfPlayers
      };

      updatedPlayersList.forEach((player) => {
        io.to(player.socketId).emit("updateWaitingForGameData", dataToSend);
      });
    }
    else {
      await deleteDoc(docRef);

      updateAvailableMatches();
    }
  });


  socket.on("disconnect", () => {
    console.log(`Client disconneted: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
