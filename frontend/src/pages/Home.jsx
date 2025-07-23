import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function Home() {
  const [pseudo, setPseudo] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!pseudo) return;
    socket.emit("createRoom", { pseudo }, (roomId) => {
      navigate(`/lobby/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!pseudo || !roomCode) return;
    socket.emit("joinRoom", { pseudo, roomId: roomCode }, (ok) => {
      if (ok) navigate(`/lobby/${roomCode}`);
      else alert("Salle introuvable ou pleine.");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            🎯 MotChrono
          </h1>
          <p className="text-sm text-gray-500">Joue en ligne avec tes amis</p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-gray-700 font-medium">
            Ton pseudo
          </label>
          <input
            type="text"
            placeholder="El Diablo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateRoom}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-lg shadow hover:bg-indigo-700 transition"
          >
            🚀 Créer une salle
          </button>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-3">
          <label className="block text-sm text-gray-700 font-medium">
            Code de la salle
          </label>
          <input
            type="text"
            placeholder="ABCD"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full py-2 bg-green-600 text-white rounded-xl font-semibold text-lg shadow hover:bg-green-700 transition"
          >
            ✏️ Rejoindre
          </button>
        </div>
      </div>

      <p
        onClick={() => navigate("/rules")}
        className="mt-6 text-sm text-indigo-600 hover:underline cursor-pointer transition"
      >
        📘 Voir les règles du jeu
      </p>
      <p className="text-center text-sm text-gray-400 mt-4">
        <a href="/mentions-legales" className="underline hover:text-gray-600">
          Mentions légales
        </a>
      </p>
    </div>
  );
}

export default Home;
