// backend/rooms.js

const rooms = {};

function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function createRoom(socket, pseudo) {
  let roomId;
  do {
    roomId = generateRoomId();
  } while (rooms[roomId]); // éviter les doublons

  rooms[roomId] = {
    players: [{ id: socket.id, pseudo }],
  };

  socket.join(roomId);
  return roomId;
}

function joinRoom(socket, roomId, pseudo) {
  const room = rooms[roomId];
  if (!room || room.players.length >= 4) return false; 

  socket.join(roomId);
  room.players.push({ id: socket.id, pseudo });

  return true;
}
function getPlayers(roomId) {
  const room = rooms[roomId];
  if (!room) {
    return { players: [], hostId: null };
  }

  return {
    players: room.players, // [{ id, pseudo }]
    hostId: room.players[0]?.id || null,
  };
}

function removePlayer(socket) {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const index = room.players.findIndex((p) => p.id === socket.id);

    if (index !== -1) {
      room.players.splice(index, 1);
      socket.leave(roomId);

      if (room.players.length === 0) {
        delete rooms[roomId]; // supprime la room si vide
      }

      return roomId;
    }
  }

  return null;
}

module.exports = {
  createRoom,
  joinRoom,
  getPlayers,
  removePlayer,
};