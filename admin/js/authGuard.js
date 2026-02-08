// root/admin/js/authGuard.js

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "../../js/firebase.js"; // path relative to admin/index.html

export function initAuthGuard(initAdmin) {
  onAuthStateChanged(auth, user => {
    if (!user) {
      location.href = "../index.html"; // redirect to public page
      return;
    }
    initAdmin?.();
  });
}
