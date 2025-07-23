function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl bg-white shadow-lg rounded-xl p-6 space-y-4 text-left">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">📄 Mentions légales</h1>

        <p><strong>Éditeur :</strong> Ce site est un projet personnel et non commercial développé à des fins ludiques.</p>

        <p><strong>Hébergement :</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Frontend : Vercel (https://vercel.com)</li>
          <li>Backend : Render (https://render.com)</li>
        </ul>

        <p><strong>Données personnelles :</strong> Aucune donnée personnelle n’est collectée. Aucune utilisation de cookies de suivi ou de publicité.</p>

        <p className="text-sm text-gray-500">Dernière mise à jour : juillet 2025</p>
      </div>
    </div>
  );
}

export default MentionsLegales;