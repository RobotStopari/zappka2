// root/admin/js/lectorsUI.js
import { allLectors, preloadLectors, getLector } from "./lectorsData.js";
import { initLectorFormHandlers } from "./lectorsForm.js";

let editingLectorId = null;

// -----------------------------
// Render lector bubbles
// -----------------------------
export async function renderLectors() {
  const list = document.getElementById("lectors-list");
  list.innerHTML = "";

  await preloadLectors();

  // Sort alphabetically by nick, fallback to name
  const sorted = allLectors.slice().sort((a, b) => {
    const keyA = a.nick?.trim().toLowerCase() || a.name.toLowerCase();
    const keyB = b.nick?.trim().toLowerCase() || b.name.toLowerCase();
    return keyA.localeCompare(keyB);
  });

  sorted.forEach(l => {
    const span = document.createElement("span");
    span.className = "lector-chip";
    span.style.backgroundColor = l.color || "#6c757d";

    // Display fallback if nick is empty
    span.textContent = l.nick ? `${l.nick} — ${l.name}` : l.name;

    // open edit modal
    span.addEventListener("click", () => openLectorPopup(l.id));

    list.appendChild(span);
  });
}

// -----------------------------
// Open edit modal
// -----------------------------
export async function openLectorPopup(id) {
  editingLectorId = id;
  const l = await getLector(id);

  // Set form values
  document.getElementById("edit-lector-nick").value = l.nick || "";
  document.getElementById("edit-lector-name").value = l.name || "";
  document.getElementById("edit-lector-color").value = l.color || "#6c757d";

  // Show modal
  new bootstrap.Modal(document.getElementById("lectorModal")).show();

  // Initialize form handlers (save/delete)
  initLectorFormHandlers(editingLectorId);
}

// -----------------------------
// Expose render globally so other modules can call it
// -----------------------------
window.renderLectors = renderLectors;
window.editingLectorId = editingLectorId;
