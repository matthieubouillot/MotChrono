import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function Results() {
  const [results, setResults] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.results) {
      setCorrectAnswers(location.state.results.correctAnswers || []);
      setResults(location.state.results.results || []);
    }

    socket.emit("getPlayersCount", (count) => {
      setTotalPlayers(count);
    });

    const handleGameOver = (data) => {
      setCorrectAnswers(data.correctAnswers || []);
      setResults((prev) => {
        const newList = [...prev];
        for (const player of data.results) {
          if (!newList.find((r) => r.pseudo === player.pseudo)) {
            newList.push(player);
          }
        }
        return newList.sort((a, b) => a.total - b.total);
      });
    };

    socket.on("gameOver", handleGameOver);
    return () => socket.off("gameOver", handleGameOver);
  }, [location]);

  const allPlayersFinished = totalPlayers !== null && results.length === totalPlayers;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-b from-white to-gray-100 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">🏁 Résultats de la partie</h1>

      {results.length > 0 ? (
        <>
          <ul className="w-full max-w-3xl space-y-6">
            {results.map((r, index) => (
              <li
                key={r.pseudo}
                className={`p-6 rounded-xl shadow-md transition-all ${
                  index === 0
                    ? "bg-yellow-100 border border-yellow-400 font-bold scale-105"
                    : "bg-white"
                }`}
              >
                <p className="text-lg mb-1">
                  🏅 {index + 1} — <span className="text-indigo-700">{r.pseudo}</span>
                </p>
                <p className="text-sm text-gray-600">
                  ⏱ Temps total : <strong>{formatTime(r.total)}</strong>
                </p>

                <div className="mt-3 text-left">
                  <p className="font-semibold text-sm mb-2">Réponses données :</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {r.responses?.map((resp, i) => (
                      <li key={i}>
                        Manche {i + 1} :{" "}
                        <strong>
                          {resp
                            ? `${resp} (${formatTime(
                                r.total && r.responses.length > 0
                                  ? Math.floor(r.total / r.responses.length)
                                  : 0
                              )})`
                            : "⏱ Temps écoulé"}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>

          {!allPlayersFinished && (
            <p className="mt-6 text-gray-500 animate-pulse">
              En attente des autres joueurs ({results.length}/{totalPlayers})...
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-md animate-pulse">En attente des résultats...</p>
      )}

      {correctAnswers.length > 0 && (
        <div className="mt-10 w-full max-w-3xl bg-white p-6 rounded-xl shadow text-left">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">🧠 Bonnes réponses :</h2>
          <ul className="list-disc list-inside text-sm text-gray-800">
            {correctAnswers.map((w, i) => (
              <li key={i}>
                Manche {i + 1} : <strong>{w}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="mt-10 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow text-lg transition"
      >
        🔁 Retour à l’accueil
      </button>
    </div>
  );
}

export default Results;