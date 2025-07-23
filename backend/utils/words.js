const wordsByLength = require("./base_words.json");

// ✅ Tire un mot aléatoire d'une longueur donnée
function getRandomWord(length = 5) {
  const words = wordsByLength[String(length)];
  if (!words || words.length === 0) {
    console.error(`❌ Aucun mot trouvé avec une longueur de ${length}`);
    return null;
  }

  const word = words[Math.floor(Math.random() * words.length)];
  return word.toLowerCase();
}

// ✅ Mélange les lettres d’un mot
function shuffleWord(word) {
  if (!word) return null;

  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// ✅ Génère un mot original + sa version mélangée (différente !)
function getShuffledWord(length = 5) {
  const original = getRandomWord(length);
  if (!original) {
    throw new Error(`❌ Impossible de générer un mot de longueur ${length}`);
  }

  let shuffled = shuffleWord(original);
  let attempts = 0;

  // 🔁 Assure que le mot mélangé est différent
  while (shuffled === original && attempts < 10) {
    shuffled = shuffleWord(original);
    attempts++;
  }

  if (shuffled === original) {
    console.warn(`⚠️ Impossible de mélanger un mot différent après ${attempts} essais, mot original utilisé`);
    // Si échec, on pourrait forcer manuellement un mélange
    shuffled = original.split("").reverse().join("");
  }

  return { original, shuffled };
}

module.exports = {
  getShuffledWord,
  shuffleWord, // <- exporté pour être réutilisé dans `resendCurrentRound`
};