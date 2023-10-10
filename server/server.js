const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");

const db = require("./javascript/firebase");
const CONSTANS = require("./javascript/constants");
const { collection, getDocs, addDoc } = require("firebase/firestore");

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


io.on("connection", (socket) => {
  const matchesRef = collection(db, "matches");
  console.log(`New client joined: ${socket.id}`);

  socket.on("createGame", async (playerName, requiredAmountOfPlayers) => {
    const players = [];
    players.push({ name: playerName, socketId: socket.id });
    console.log(playerName, requiredAmountOfPlayers);

    await addDoc(matchesRef, {
      state: CONSTANS.GAME_STATES.WAITING_FOR_PLAYERS,
      requiredAmountOfPlayers,
      players,
    });
  });

  socket.on("getAvailableMatches", async () => {
    const listOfAvaiableMatches = await getDocs(matchesRef).then((snap) => {
      const list = [];
      snap.docs.map((doc) => {
        const data = doc.data();
        if (data.state === CONSTANS.GAME_STATES.WAITING_FOR_PLAYERS) {
          list.push(Object.assign(data, {id: doc.id}));
        }
      });

      return list;
    });

    socket.emit("updateAvailableMatches", listOfAvaiableMatches);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconneted: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
