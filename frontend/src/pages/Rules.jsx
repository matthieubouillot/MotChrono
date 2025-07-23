import { useNavigate } from "react-router-dom";

function Rules() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">📘 Règles du jeu</h1>
          <p className="text-sm text-gray-500">Bienvenue sur MotChrono ! Voici comment jouer :</p>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <p><strong>🎯 Objectif :</strong> retrouver le mot d'origine à partir des lettres mélangées.</p>

          <ul className="list-disc list-inside space-y-2">
            <li>Chaque partie se joue en <strong>5 manches</strong>.</li>
            <li>À chaque manche, un <strong>mot mélangé</strong> est affiché.</li>
            <li>Tu as <strong>2 minutes</strong> pour retrouver le mot original.</li>
            <li>Tu peux faire autant d'essais que tu veux avant la fin du temps.</li>
            <li>Si tu trouves le mot, tu passes automatiquement à la manche suivante.</li>
            <li>Le classement final est basé sur le <strong>temps total</strong> mis pour trouver les mots.</li>
            <li>Si tu ne trouves pas, la manche est terminée au bout de 2 minutes.</li>
          </ul>

          <p className="pt-2">Le joueur le plus rapide à résoudre tous les mots gagne ! 🏆</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg shadow"
        >
          🔙 Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

export default Rules;