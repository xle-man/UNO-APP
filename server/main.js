const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});
