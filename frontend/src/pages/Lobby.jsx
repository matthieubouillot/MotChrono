import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function Lobby() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("getPlayers", roomId, (data) => {
      if (!data || !Array.isArray(data.players)) {
        console.error("❌ getPlayers: données invalides", data);
        return;
      }
      setPlayers(data.players);
      setIsHost(socket.id === data.hostId);
    });

    socket.on("updatePlayers", (data) => {
      if (!data || !Array.isArray(data.players)) {
        console.error("❌ updatePlayers: données invalides", data);
        return;
      }
      setPlayers(data.players);
      setIsHost(socket.id === data.hostId);
    });

    socket.on("newRound", ({ round, shuffled }) => {
      navigate("/game");
    });

    socket.on("errorMessage", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("newRound");
      socket.off("errorMessage");
    };
  }, [roomId, navigate]);

  const startGame = () => {
    socket.emit("startGame", roomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-indigo-700">🚪 Salle : {roomId}</h1>

        <div className="text-left">
          <h2 className="text-md font-semibold text-gray-700 mb-2">👥 Joueurs connectés :</h2>
          <ul className="space-y-1 text-gray-800">
            {players.map((p, i) => (
              <li key={i} className="px-3 py-1 rounded bg-gray-100">{p.pseudo || p}</li>
            ))}
          </ul>
        </div>

        {isHost ? (
          <button
            onClick={startGame}
            disabled={players.length < 2}
            className={`w-full py-2 rounded-xl font-semibold text-lg shadow transition ${
              players.length < 2
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            🚀 Lancer la partie
          </button>
        ) : (
          <p className="text-gray-500 text-sm">En attente du lancement de la partie...</p>
        )}
      </div>
    </div>
  );
}

export default Lobby;