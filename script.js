let pseudo = "";
let isAdmin = false;
let questions = [];
let currentQuestionIndex = 0;
let allResponses = {}; // {"Alice": ["Paris", "Bleu"]}

function connectUser() {
    pseudo = document.getElementById("pseudo").value.trim();
    if (pseudo.length < 2) {
        alert("Pseudo trop court !");
        return;
    }
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("waiting-room").classList.remove("hidden");
    document.getElementById("username").innerText = pseudo;
}

function connectAdmin() {
    const password = document.getElementById("admin-password").value;
    if (password === "admin123") {
        isAdmin = true;
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
    } else {
        alert("Mot de passe incorrect !");
    }
}

function handlePPTXUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("pptx-status").innerText = "Fichier chargé : " + file.name;

    parsePPTX(file).then(result => {
        questions = result;
        alert(questions.length + " questions chargées !");
    });
}

function startQuiz() {
    if (questions.length === 0) {
        alert("Aucune question chargée !");
        return;
    }
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("waiting-room").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById("question-text").innerText = q.question;

    if (isAdmin) {
        document.getElementById("admin-answer").innerText = "Réponse attendue : " + q.answer;
        document.getElementById("admin-controls").classList.remove("hidden");
        document.getElementById("player-controls").classList.add("hidden");
        showAllResponses();
    } else {
        document.getElementById("admin-controls").classList.add("hidden");
        document.getElementById("player-controls").classList.remove("hidden");
        const existing = getMyAnswer(currentQuestionIndex);
        if (existing) {
            document.getElementById("player-response").value = existing;
            document.getElementById("player-response").disabled = true;
        } else {
            document.getElementById("player-response").value = "";
            document.getElementById("player-response").disabled = false;
        }
    }
}

function getMyAnswer(index) {
    const stored = sessionStorage.getItem("responses");
    if (!stored) return null;
    const obj = JSON.parse(stored);
    return obj[index];
}

function submitAnswer() {
    const response = document.getElementById("player-response").value.trim();
    if (response === "") {
        alert("Veuillez entrer une réponse.");
        return;
    }

    let myData = sessionStorage.getItem("responses");
    myData = myData ? JSON.parse(myData) : {};
    myData[currentQuestionIndex] = response;
    sessionStorage.setItem("responses", JSON.stringify(myData));

    document.getElementById("player-response").disabled = true;
    alert("✅ Réponse enregistrée !");
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        alert("🎉 Quiz terminé !");
        location.reload();
    } else {
        showQuestion();
    }
}

function showAllResponses() {
    const output = document.getElementById("admin-responses");
    output.innerHTML = "<h3>📋 Réponses des joueurs</h3>";
    for (const name in allResponses) {
        const answers = allResponses[name];
        const a = answers[currentQuestionIndex] || "(pas de réponse)";
        output.innerHTML += `<p><b>${name}:</b> ${a}</p>`;
    }
}

function simulatePlayerSubmission(name, responses) {
    allResponses[name] = responses;
}


// Cette fonction lit un fichier .pptx et extrait les titres des slides (questions)
async function parsePPTX(file) {
    const zip = await JSZip.loadAsync(file);
    const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/));

    const questions = [];

    for (const name of slideFiles.sort()) {
        const content = await zip.files[name].async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "application/xml");

        // Lecture des <a:t> qui contiennent les textes visibles
        const texts = [...xmlDoc.getElementsByTagName("a:t")].map(el => el.textContent);
        if (texts.length >= 1) {
            const question = texts[0]; // Premier texte = question
            const answer = texts.slice(1).join(" "); // Le reste = réponse attendue (optionnel)
            questions.push({ question, answer });
        }
    }

    console.log("✅ Questions extraites :", questions);
    return questions;
}


let scores = {};  // { "Alice": 2, "Bob": -1 }

function updateScore(name, delta) {
    if (!(name in scores)) scores[name] = 0;
    scores[name] += delta;
    showAllResponses();  // Refresh display
}

function showAllResponses() {
    const output = document.getElementById("admin-responses");
    output.innerHTML = "<h3>📋 Réponses des joueurs</h3>";
    for (const name in allResponses) {
        const answers = allResponses[name];
        const a = answers[currentQuestionIndex] || "(pas de réponse)";
        const score = scores[name] || 0;
        output.innerHTML += `
            <div>
                <b>${name}:</b> ${a}
                <button onclick="updateScore('${name}', 1)">+1</button>
                <button onclick="updateScore('${name}', -1)">-1</button>
                <span>(Score: ${score})</span>
            </div>
        `;
    }
}

function showFinalScores() {
    const summaryDiv = document.createElement("div");
    summaryDiv.innerHTML = "<h2>🏁 Scores finaux</h2>";
    for (const name in scores) {
        summaryDiv.innerHTML += `<p><b>${name}:</b> ${scores[name]}</p>`;
    }
    const btn = document.createElement("button");
    btn.textContent = "📁 Télécharger les scores (CSV)";
    btn.onclick = downloadCSV;
    summaryDiv.appendChild(btn);

    const container = document.querySelector(".container");
    container.innerHTML = "";
    container.appendChild(summaryDiv);
}

function downloadCSV() {
    let csv = "Pseudo,Score\n";
    for (const name in scores) {
        csv += `${name},${scores[name]}\n`;
    }
    const blob = new Blob([csv], {{ type: 'text/csv' }});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scores_finaux.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// Modifier la fin du quiz
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        alert("🎉 Quiz terminé !");
        showFinalScores();
    } else {
        showQuestion();
    }
}