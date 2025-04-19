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
