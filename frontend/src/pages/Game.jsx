import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function Game() {
  const [round, setRound] = useState(1);
  const [shuffled, setShuffled] = useState("");
  const [originalLength, setOriginalLength] = useState(0);
  const [answer, setAnswer] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hasReceivedRound, setHasReceivedRound] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleNewRound = ({ round, shuffled, originalLength }) => {
      setRound(round);
      setShuffled(shuffled);
      setOriginalLength(originalLength);
      setAnswer("");
      setStartTime(Date.now());
      setTimeLeft(10);
      setHasReceivedRound(true);
      setWaitingForOthers(false);
    };

    const handleGameOver = (data) => {
      navigate("/results", { state: { results: data } });
    };

    const handlePlayerFinished = () => {
      if (round > 5) setWaitingForOthers(true);
    };

    socket.on("newRound", handleNewRound);
    socket.on("gameOver", handleGameOver);
    socket.on("playerFinished", handlePlayerFinished);
    socket.emit("resendCurrentRound");

    return () => {
      socket.off("newRound", handleNewRound);
      socket.off("gameOver", handleGameOver);
      socket.off("playerFinished", handlePlayerFinished);
    };
  }, [navigate, round]);

  useEffect(() => {
    if (!startTime || timeLeft <= 0 || waitingForOthers || round > 5) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          socket.emit("submitAnswer", {
            answer: "",
            time: 120,
            timeout: true,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLeft, waitingForOthers, round]);

  const handleSubmit = () => {
    if (!answer.trim() || round > 5) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    socket.emit("submitAnswer", {
      answer: answer.trim(),
      time: timeTaken,
    });

    setAnswer("");
  };

  if (waitingForOthers || round > 5) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-md animate-pulse">
          <h1 className="text-2xl font-bold text-green-600 mb-2">✅ Partie terminée !</h1>
          <p className="text-gray-500 text-md">En attente des autres joueurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md space-y-5">
        <h1 className="text-2xl font-bold text-indigo-700">🧠 Manche {round} / 5</h1>

        {!hasReceivedRound ? (
          <p className="text-gray-500">🔄 En attente du mot mélangé...</p>
        ) : (
          <>
            <div className="text-xl">
              Mot mélangé :
              <span className="block text-indigo-600 font-mono text-2xl tracking-widest mt-1">
                {shuffled}
              </span>
            </div>

            <div className="text-gray-600">
              ⏱ Temps restant :
              <span className="ml-1 font-semibold text-red-500">{formatTime(timeLeft)}</span>
            </div>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Mot de ${originalLength} lettres`}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
            />

            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-green-600 text-white rounded-xl font-semibold text-lg shadow hover:bg-green-700 transition"
            >
               Valider
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Game;