// import db from "./javascript/firebase";
const db = require("./javascript/firebase");

const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const path = require("path");

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
  console.log(`New client joined: ${socket.id}`);

  setTimeout(() => {
    socket.emit("test", "Event, which was emmited after 5 seconds.");
  }, 5000);

  socket.on("disconnect", () => {
    console.log(`Client disconneted: ${socket.id}`);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
