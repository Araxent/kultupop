function joinQuiz() {
    const pseudo = document.getElementById("pseudo").value.trim();
    if (!pseudo) {
        alert("Veuillez entrer un pseudo.");
        return;
    }
    sessionStorage.setItem("pseudo", pseudo);
    window.location.href = "quiz.html";
}

function loginAdmin() {
    const password = document.getElementById("adminPassword").value;
    if (password === "admin") {
        window.location.href = "admin.html";
    } else {
        alert("Mot de passe incorrect !");
    }
}

function handleFileUpload() {
    const input = document.getElementById("pptxFile");
    const file = input.files[0];
    if (!file || !file.name.endsWith(".pptx")) {
        alert("Veuillez sélectionner un fichier PowerPoint (.pptx).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        // Simule l'extraction des questions à partir du fichier .pptx
        const questions = [
            "Quelle est la capitale de la France ?",
            "Combien de continents y a-t-il ?",
            "Qui a peint La Joconde ?"
        ];
        localStorage.setItem("quiz_questions", JSON.stringify(questions));
        localStorage.setItem("questionIndex", "-1");

        alert("Quiz chargé avec succès !");
        document.getElementById("quizControl").style.display = "block";
    };
    reader.readAsArrayBuffer(file);
}

function startQuiz() {
    localStorage.setItem("questionIndex", "0");
    alert("Quiz lancé !");
}

function nextQuestion() {
    let index = parseInt(localStorage.getItem("questionIndex") || "-1");
    const questions = JSON.parse(localStorage.getItem("quiz_questions") || "[]");

    if (index + 1 < questions.length) {
        localStorage.setItem("questionIndex", (index + 1).toString());
    } else {
        alert("Fin du quiz !");
    }
}

function exportFinalScores() {
    const scores = {
        "Alice": 3,
        "Bob": 2
    };

    const blob = new Blob([JSON.stringify(scores, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scores_final.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}