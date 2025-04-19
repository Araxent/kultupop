let currentQuestionIndex = 0;
let quizData = [];

function joinQuiz() {
    const pseudo = document.getElementById("pseudo").value.trim();
    if (pseudo) {
        sessionStorage.setItem("pseudo", pseudo);
        sessionStorage.setItem("isAdmin", "false");
        window.location.href = "quiz.html";
    } else {
        alert("Veuillez entrer un pseudo.");
    }
}

function adminLogin() {
    const password = document.getElementById("admin-pass").value;
    if (password === "admin123") {
        sessionStorage.setItem("pseudo", "Admin");
        sessionStorage.setItem("isAdmin", "true");
        window.location.href = "admin.html";
    } else {
        alert("Mot de passe incorrect.");
    }
}

function loadPPTX() {
    const fileInput = document.getElementById("pptxFile");
    const file = fileInput.files[0];
    if (!file) {
        alert("Veuillez sélectionner un fichier PowerPoint (.pptx)");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        const parser = new PPTXParser();
        const result = await parser.parse(arrayBuffer);

        quizData = result.slides
            .slice(1)  // on ignore le titre
            .map(slide => ({
                question: slide.title || "Sans titre",
                answer: slide.texts?.[0] || "Pas de réponse"
            }));

        if (quizData.length > 0) {
            currentQuestionIndex = 0;
            document.getElementById("quizControl").style.display = "block";
            displayCurrentQuestion();
        } else {
            alert("Aucune question détectée.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function displayCurrentQuestion() {
    const question = quizData[currentQuestionIndex];
    document.getElementById("questionTitle").innerText = "Question " + (currentQuestionIndex + 1);
    document.getElementById("questionText").innerText = question.question;

    // On sauvegarde la question courante pour les joueurs
    localStorage.setItem("currentQuestion", JSON.stringify(question));
    localStorage.setItem("questionIndex", currentQuestionIndex);
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
    } else {
        alert("Fin du quiz !");
    }
}


function loadPlayerView() {
    const pseudo = sessionStorage.getItem("pseudo");
    document.getElementById("pseudoDisplay").innerText = pseudo || "joueur";

    // Afficher la question actuelle depuis le localStorage (mise à jour dynamique)
    const question = JSON.parse(localStorage.getItem("currentQuestion"));
    const index = localStorage.getItem("questionIndex");

    if (question) {
        document.getElementById("currentQuestionTitle").innerText = "Question " + (parseInt(index) + 1);
        document.getElementById("currentQuestionText").innerText = question.question;
    } else {
        document.getElementById("currentQuestionText").innerText = "En attente du lancement du quiz...";
        document.getElementById("responseBox").style.display = "none";
    }

    // Score local (modifiable côté admin manuellement)
    let score = localStorage.getItem("score_" + pseudo);
    if (!score) score = 0;
    document.getElementById("scoreDisplay").innerText = score;
}

function submitAnswer() {
    const pseudo = sessionStorage.getItem("pseudo");
    const answer = document.getElementById("playerAnswer").value.trim();

    if (!answer) {
        alert("Merci d'écrire une réponse avant de valider.");
        return;
    }

    // Stockage local (ou on peut l'envoyer à une base plus tard)
    localStorage.setItem("answer_" + pseudo + "_" + localStorage.getItem("questionIndex"), answer);

    document.getElementById("confirmationMessage").innerText = "Réponse enregistrée !";
    document.getElementById("playerAnswer").value = "";
}