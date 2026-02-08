// root/admin/js/blockModal.js

import { doc, getDoc, updateDoc, addDoc, deleteDoc, Timestamp, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";
import { allLectors } from "./lectorsData.js";
import { toLocal } from "./utils.js";

let isNewBlock = false;
let deletingBlockId = null;

export async function openBlock(id, isNew = false) {
  isNewBlock = isNew;
  const ref = doc(db, "zapalovac", "2026", "blocks", id);
  const snap = await getDoc(ref);
  const b = snap.data();

  document.getElementById("block-id").value = id;
  document.getElementById("block-name").value = b.name || "";
  document.getElementById("block-topic").value = b.topic || "";
  document.getElementById("block-type").value = b.type || "program";
  document.getElementById("block-desc").value = b.desc || "";
  document.getElementById("block-start").value = toLocal(b.start);
  document.getElementById("block-end").value = b.end ? toLocal(b.end) : "";

  renderLectorCheckboxes(b.lectors || []);
  updateSelectedBubbles(b.lectors || []);
  initLectorsDropdown();

  // Update modal title and duplicate button visibility
  const modalTitle = document.querySelector("#blockModal .modal-title");
  const duplicateBtn = document.getElementById("duplicate-block-btn");
  if (isNew) {
    modalTitle.innerHTML = '<i class="fas fa-square-plus"></i> Create Block';
    duplicateBtn.style.display = "none";
  } else {
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Block';
    duplicateBtn.style.display = "inline-block";
  }

  new bootstrap.Modal(document.getElementById("blockModal")).show();
}

export function renderLectorCheckboxes(selectedRefs) {
  const box = document.getElementById("block-lectors");
  box.innerHTML = "";

  allLectors.forEach(l => {
    const checked = selectedRefs.some(r => r.id === l.id);
    box.innerHTML += `
      <div class="lector-check-item" data-lector-id="${l.id}">
        <div class="lector-bubble-check" style="background: ${l.color || '#999'};"></div>
        <div class="lector-check-content">
          <input class="form-check-input lector-checkbox" type="checkbox" value="${l.id}" ${checked ? "checked" : ""}>
          <label class="lector-check-label">${l.name}${l.nick ? ' — ' + l.nick : ''}</label>
        </div>
      </div>
    `;
  });
}

function updateSelectedBubbles(selectedRefs) {
  const bubblesContainer = document.getElementById("selected-bubbles");
  bubblesContainer.innerHTML = "";

  if (selectedRefs.length === 0) {
    bubblesContainer.innerHTML = '<span class="text-muted small">Select lectors...</span>';
    return;
  }

  selectedRefs.forEach(ref => {
    const lector = allLectors.find(l => l.id === ref.id);
    if (lector) {
      bubblesContainer.innerHTML += `
        <div class="lector-bubble" style="background: ${lector.color || '#999'};" title="${lector.name}${lector.nick ? ' — ' + lector.nick : ''}"></div>
      `;
    }
  });
}

function adjustBrightness(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

function initLectorsDropdown() {
  const toggle = document.getElementById("lectors-toggle");
  const dropdown = document.getElementById("lectors-dropdown");

  // Remove old listeners
  toggle.replaceWith(toggle.cloneNode(true));
  const newToggle = document.getElementById("lectors-toggle");

  newToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    newToggle.classList.toggle("active");
  });

  // Make entire row clickable to toggle checkbox
  dropdown.querySelectorAll(".lector-check-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const checkbox = item.querySelector(".lector-checkbox");
      checkbox.checked = !checkbox.checked;
      const selectedRefs = [...dropdown.querySelectorAll(".lector-checkbox:checked")]
        .map(cb => ({ id: cb.value }));
      updateSelectedBubbles(selectedRefs);
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".lectors-dropdown")) {
      dropdown.classList.remove("show");
      newToggle.classList.remove("active");
    }
  });
}

export function initSaveBlock() {
  document.getElementById("save-block").addEventListener("click", async () => {
    const id = document.getElementById("block-id").value;
    const ref = doc(db, "zapalovac", "2026", "blocks", id);
    const selected = [...document.querySelectorAll(".lector-checkbox:checked")]
      .map(cb => allLectors.find(l => l.id === cb.value).ref);

    await updateDoc(ref, {
      name: document.getElementById("block-name").value,
      topic: document.getElementById("block-topic").value,
      type: document.getElementById("block-type").value,
      desc: document.getElementById("block-desc").value,
      start: Timestamp.fromDate(new Date(document.getElementById("block-start").value)),
      end: document.getElementById("block-end").value ? Timestamp.fromDate(new Date(document.getElementById("block-end").value)) : null,
      lectors: selected
    });

    bootstrap.Modal.getInstance(document.getElementById("blockModal")).hide();

    // reload blocks while preserving scroll position
    const scrollPos = window.scrollY;
    await window.loadBlocks?.(window.attachBlockHandlers);
    setTimeout(() => window.scrollTo(0, scrollPos), 50);
  });

  // Delete block
  document.getElementById("delete-block-btn").addEventListener("click", async () => {
    deletingBlockId = document.getElementById("block-id").value;
    const blockName = document.getElementById("block-name").value || "(untitled)";
    document.getElementById("delete-block-text").textContent =
      `Are you sure you want to delete the block "${blockName}"?`;

    new bootstrap.Modal(document.getElementById("deleteBlockModal")).show();
  });

  // Confirm delete block
  document.getElementById("confirm-delete-block-btn").addEventListener("click", async () => {
    if (!deletingBlockId) return;

    const ref = doc(db, "zapalovac", "2026", "blocks", deletingBlockId);
    await deleteDoc(ref);

    bootstrap.Modal.getInstance(document.getElementById("deleteBlockModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("blockModal")).hide();

    deletingBlockId = null;
    const scrollPos = window.scrollY;
    await window.loadBlocks?.(window.attachBlockHandlers);
    setTimeout(() => window.scrollTo(0, scrollPos), 50);
  });

  // Duplicate block
  document.getElementById("duplicate-block-btn").addEventListener("click", async () => {
    const id = document.getElementById("block-id").value;
    const ref = doc(db, "zapalovac", "2026", "blocks", id);
    const snap = await getDoc(ref);
    const b = snap.data();

    // Create new block with exact same data
    await addDoc(collection(db, "zapalovac", "2026", "blocks"), {
      name: b.name,
      topic: b.topic,
      type: b.type,
      desc: b.desc,
      start: b.start,
      end: b.end,
      lectors: b.lectors || []
    });

    bootstrap.Modal.getInstance(document.getElementById("blockModal")).hide();
    const scrollPos = window.scrollY;
    await window.loadBlocks?.(window.attachBlockHandlers);
    setTimeout(() => window.scrollTo(0, scrollPos), 50);
  });
}
