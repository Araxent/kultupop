function loginAdmin() {
    const pwd = document.getElementById("adminPassword").value;
    if (pwd === "admin123") {
        sessionStorage.setItem("isAdmin", "true");
        window.location.href = "admin.html";
    } else {
        alert("Mot de passe incorrect.");
    }
}

function joinQuiz() {
    const pseudo = document.getElementById("pseudo").value.trim();
    if (!pseudo) {
        alert("Veuillez entrer un pseudo.");
        return;
    }
    sessionStorage.setItem("pseudo", pseudo);
    sessionStorage.setItem("isAdmin", "false");
    window.location.href = "quiz.html";
}

function handleFileUpload() {
    const input = document.getElementById("pptxFile");
    const file = input.files[0];
    if (!file) {
        alert("Merci de sélectionner un fichier PowerPoint.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        readPptx(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
}

function readPptx(arrayBuffer) {
    JSZip.loadAsync(arrayBuffer).then(function (zip) {
        const slideFiles = Object.keys(zip.files).filter(name => name.match(/^ppt\/slides\/slide[0-9]+\.xml$/));
        slideFiles.sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
            const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
            return numA - numB;
        });

        const promises = slideFiles.map(slide => zip.files[slide].async("string"));

        Promise.all(promises).then(slideContents => {
            const questions = slideContents.map(content => {
                const match = content.match(/<a:t>(.*?)<\/a:t>/);
                return match ? match[1] : "Question vide";
            });

            localStorage.setItem("quiz_questions", JSON.stringify(questions));
            localStorage.setItem("questionIndex", "0");
            document.getElementById("quizControl").style.display = "block";
            alert("Quiz chargé avec " + questions.length + " questions.");
        });
    }).catch(err => {
        alert("Erreur lors de la lecture du fichier PowerPoint.");
        console.error(err);
    });
}

function startQuiz() {
    const questions = JSON.parse(localStorage.getItem("quiz_questions") || "[]");
    if (questions.length === 0) {
        alert("Aucune question chargée.");
        return;
    }

    localStorage.setItem("questionIndex", "0");
    alert("Quiz lancé. Rendez-vous côté joueurs !");
}

function nextQuestion() {
    let index = parseInt(localStorage.getItem("questionIndex") || "0");
    const questions = JSON.parse(localStorage.getItem("quiz_questions") || "[]");

    if (index + 1 >= questions.length) {
        alert("Fin du quiz !");
        return;
    }

    index += 1;
    localStorage.setItem("questionIndex", index.toString());
    alert("Question suivante !");
}

function exportFinalScores() {
    // Placeholder simple
    alert("Export des scores à venir.");
}