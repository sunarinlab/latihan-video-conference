const express = require("express")();
const http = require("http").createServer(express);
const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: ["http://localhost:5000"],
    methods: ["GET"],
  },
});

let broadcaster = "";

io.on("connection", (socket) => {
  console.log("new device connected to server with id ", socket.id);

  socket.on("message", (message) => {
    io.emit("new-message", message, socket.id);
    console.log(message);
  });

  socket.on("broadcasting", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster", socket.id);
    console.log(broadcaster + " is starting his broadcast");
  });

  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });

  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });

  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });

  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });

  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

const PORT = 3000;

express.get("/", (req, res) => {
  res.send("<h1>INDEX</h1>");
});

http.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
