const fs = require("fs");
const readline = require("readline");
const path = require("path");

const tsvPath = path.join(__dirname, "Lexique383.tsv");
const outputPath = path.join(__dirname, "base_words.json");

const file = readline.createInterface({
  input: fs.createReadStream(tsvPath),
  crlfDelay: Infinity,
});

const wordsByLength = {};
let isFirstLine = true;
let totalWords = 0;

file.on("line", (line) => {
  if (isFirstLine) {
    isFirstLine = false;
    return;
  }

  const columns = line.split("\t");
  const ortho = columns[0]?.toLowerCase();
  const cgram = columns[3];     // NOM, ADJ, VER, AUX...
  const nombre = columns[5];    // s (singulier), p (pluriel), vide parfois
  const freq = parseFloat(columns[6]); // freqlemlivres

  if (
    ortho &&
    ortho.length >= 4 &&
    ortho.length <= 8 &&
    /^[a-zàâçéèêëîïôûùüÿæœ]+$/i.test(ortho) && // lettres seulement avec accents
    !ortho.includes("-") &&
    !ortho.includes("’") &&
    !ortho.includes("'") &&
    !ortho.endsWith("s") &&                 // filtre mots au pluriel
    (cgram === "NOM" || cgram === "ADJ") && // uniquement noms et adjectifs
    nombre === "s" &&                       // uniquement singuliers
    freq >= 50                              // très fréquents
  ) {
    const len = ortho.length;
    if (!wordsByLength[len]) wordsByLength[len] = [];
    wordsByLength[len].push(ortho);
    totalWords++;
  }
});

file.on("close", () => {
  fs.writeFileSync(outputPath, JSON.stringify(wordsByLength, null, 2), "utf-8");
});