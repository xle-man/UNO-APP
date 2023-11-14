const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");

const db = require("./javascript/firebase");
const CONSTANTS = require("./javascript/constants");
const { collection, getDocs, addDoc, updateDoc, getDoc, doc, deleteDoc } = require("firebase/firestore");

const PORT = process.env.PORT || 3000;

const app = express();
let deck = [];
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

function initalizeGame() {

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

    console.log(updatedPlayersList);



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
      deck = shuffleArray([...temp])
      updatedPlayersList.forEach((player) => {
        let cards = [];
        for (let i = 0; i < 7; i++) {
          cards.push(deck[0])
          deck.splice(0, 1);
        }

        io.to(player.socketId).emit("getCards", cards)
      })
      console.log(deck);

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
