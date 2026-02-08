// root/admin/js/lectorsForm.js
import { addLector, updateLector, deleteLector, allLectors, preloadLectors } from "./lectorsData.js";

let deletingLectorId = null;

// -----------------------------
// Initialize add / edit / delete handlers
// -----------------------------
export function initLectorFormHandlers(editingId = null) {
  const saveBtn = document.getElementById("save-lector-btn");
  const deleteBtn = document.getElementById("delete-lector-btn");
  const confirmDeleteBtn = document.getElementById("confirm-delete-lector-btn");

  // Save edited lector
  saveBtn.onclick = async () => {
    if (!editingId) return;

    const nick = document.getElementById("edit-lector-nick").value.trim();
    const name = document.getElementById("edit-lector-name").value.trim();
    const color = document.getElementById("edit-lector-color").value;

    await updateLector(editingId, { nick, name, color });

    bootstrap.Modal.getInstance(document.getElementById("lectorModal")).hide();
    await preloadLectors();
    await window.renderLectors();
    window.loadBlocks?.(window.attachBlockHandlers);
  };

  // Show deletion modal
  deleteBtn.onclick = () => {
    deletingLectorId = editingId;
    const l = allLectors.find(l => l.id === deletingLectorId);
    document.getElementById("delete-lector-text").textContent =
      l.nick ? `Are you sure you want to delete lector "${l.nick} — ${l.name}"?` :
        `Are you sure you want to delete lector "${l.name}"?`;

    new bootstrap.Modal(document.getElementById("deleteLectorModal")).show();
  };

  // Confirm deletion
  confirmDeleteBtn.onclick = async () => {
    if (!deletingLectorId) return;

    await deleteLector(deletingLectorId);

    bootstrap.Modal.getInstance(document.getElementById("deleteLectorModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("lectorModal")).hide();

    deletingLectorId = null;

    await preloadLectors();
    await window.renderLectors();
    window.loadBlocks?.(window.attachBlockHandlers);
  };
}

// -----------------------------
// Initialize add-lector form submit
// -----------------------------
export function initAddLectorForm() {
  const form = document.getElementById("add-lector-form");
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const nick = document.getElementById("lector-nick").value.trim();
    const name = document.getElementById("lector-name").value.trim();
    const color = document.getElementById("lector-color").value;

    await addLector({ nick, name, color });

    form.reset();
    await preloadLectors();
    await window.renderLectors();
  });
}
