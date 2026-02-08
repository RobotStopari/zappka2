import { signInWithEmailAndPassword, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth } from "./firebase.js";

const loginBtn = document.getElementById("loginBtn");
const adminLink = document.getElementById("adminLink");

loginBtn?.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => location.reload())
    .catch(err => alert(err.message));
});

// show admin link only when logged in
onAuthStateChanged(auth, user => {
  if (user && adminLink) {
    adminLink.classList.remove("d-none");
  }
});
