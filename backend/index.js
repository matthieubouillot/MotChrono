const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createRoom, joinRoom, getPlayers, removePlayer } = require("./rooms");
const { getShuffledWord } = require("./utils/words");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MotChrono backend running ✅");
});

const gameState = {};
const socketToRoom = {};
const playerProgress = {};

function findRoomForSocket(socketId) {
  return socketToRoom[socketId] || null;
}

function sendNextRound(socket, roomId) {
  const room = gameState[roomId];
  const player = playerProgress[socket.id];
  if (!room || !player || player.round > 5) return;

  const roundData = room.rounds[player.round - 1];
  if (!roundData) return;

  socket.emit("newRound", {
    round: player.round,
    shuffled: roundData.shuffled,
    originalLength: roundData.original.length,
  });
}

io.on("connection", (socket) => {

  socket.on("createRoom", ({ pseudo }, callback) => {
    const roomId = createRoom(socket, pseudo);
    socketToRoom[socket.id] = roomId;
    const data = getPlayers(roomId);
    io.to(roomId).emit("updatePlayers", data);
    callback(roomId);
  });

  socket.on("joinRoom", ({ pseudo, roomId }, callback) => {
    const success = joinRoom(socket, roomId, pseudo);
    if (success) {
      socketToRoom[socket.id] = roomId;
      const data = getPlayers(roomId);
      io.to(roomId).emit("updatePlayers", data);
    }
    callback(success);
  });

  socket.on("getPlayers", (roomId, callback) => {
    const data = getPlayers(roomId);
    callback(data);
  });

  socket.on("startGame", (roomId) => {
    const data = getPlayers(roomId);
    if (!data || data.players.length < 2) {
      socket.emit("errorMessage", "Il faut au moins 2 joueurs pour lancer la partie.");
      return;
    }

    const rounds = [];
    for (let i = 1; i <= 5; i++) {
      const { original, shuffled } = getShuffledWord(3 + i);
      rounds.push({ original, shuffled });
    }

    gameState[roomId] = {
      rounds,
      players: data.players.map((p) => ({ id: p.id, pseudo: p.pseudo })),
      finishedPlayers: [],
    };

    data.players.forEach((p) => {
      playerProgress[p.id] = {
        round: 1,
        totalTime: 0,
        finished: false,
        responses: [],
        times: [],
        answeredRounds: new Set(),
      };
    });

    data.players.forEach((p) => {
      const playerSocket = io.sockets.sockets.get(p.id);
      if (playerSocket) sendNextRound(playerSocket, roomId);
    });
  });

  socket.on("submitAnswer", ({ time, answer }) => {
    const roomId = findRoomForSocket(socket.id);
    if (!roomId || !gameState[roomId]) return;

    const state = gameState[roomId];
    const progress = playerProgress[socket.id];
    if (!progress || progress.finished) return;

    const roundIndex = progress.round - 1;
    if (progress.answeredRounds.has(roundIndex)) return;
    progress.answeredRounds.add(roundIndex);

    const roundData = state.rounds[roundIndex];
    progress.responses[roundIndex] = answer;

    const correct = answer.toLowerCase() === roundData.original.toLowerCase();
    const timeout = time >= 120;

    const roundTime = correct ? time : 120;
    progress.times[roundIndex] = roundTime;
    progress.totalTime += roundTime;
    progress.round++;

    if (progress.round > 5) {
      progress.finished = true;

      const finishedPlayerData = {
        pseudo: state.players.find((p) => p.id === socket.id)?.pseudo,
        total: progress.totalTime,
        responses: progress.responses,
        times: progress.times,
      };

      const existing = state.finishedPlayers.findIndex(p => p.pseudo === finishedPlayerData.pseudo);
      if (existing !== -1) state.finishedPlayers[existing] = finishedPlayerData;
      else state.finishedPlayers.push(finishedPlayerData);

      const correctAnswers = state.rounds.map((r) => r.original);

      socket.emit("gameOver", {
        results: state.finishedPlayers.sort((a, b) => a.total - b.total),
        correctAnswers,
      });

      state.players.forEach((p) => {
        if (p.id !== socket.id && playerProgress[p.id]?.finished) {
          const ps = io.sockets.sockets.get(p.id);
          if (ps) {
            ps.emit("gameOver", {
              results: state.finishedPlayers.sort((a, b) => a.total - b.total),
              correctAnswers,
            });
          }
        }
      });
    } else {
      sendNextRound(socket, roomId);
    }
  });

  socket.on("resendCurrentRound", () => {
    const roomId = findRoomForSocket(socket.id);
    if (!roomId || !gameState[roomId]) return;
    sendNextRound(socket, roomId);
  });

  socket.on("getPlayersCount", (callback) => {
    const roomId = findRoomForSocket(socket.id);
    if (!roomId || !gameState[roomId]) return;
    callback(gameState[roomId].players.length);
  });

  socket.on("disconnect", () => {
    const roomId = removePlayer(socket);
    delete socketToRoom[socket.id];
    delete playerProgress[socket.id];
    if (roomId) {
      const data = getPlayers(roomId);
      io.to(roomId).emit("updatePlayers", data);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
});