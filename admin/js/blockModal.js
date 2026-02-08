// root/admin/js/blockModal.js

import { doc, getDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";
import { allLectors } from "./lectorsData.js";
import { toLocal } from "./utils.js";

export async function openBlock(id) {
  const ref = doc(db, "zapalovac", "2026", "blocks", id);
  const snap = await getDoc(ref);
  const b = snap.data();

  document.getElementById("block-id").value = id;
  document.getElementById("block-name").value = b.name || "";
  document.getElementById("block-topic").value = b.topic || "";
  document.getElementById("block-type").value = b.type || "";
  document.getElementById("block-desc").value = b.desc || "";
  document.getElementById("block-start").value = toLocal(b.start);
  document.getElementById("block-end").value = b.end ? toLocal(b.end) : "";

  renderLectorCheckboxes(b.lectors || []);

  new bootstrap.Modal(document.getElementById("blockModal")).show();
}

export function renderLectorCheckboxes(selectedRefs) {
  const box = document.getElementById("block-lectors");
  box.innerHTML = "";
  allLectors.forEach(l => {
    const checked = selectedRefs.some(r => r.id === l.id);
    box.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${l.id}" ${checked ? "checked" : ""}>
        <label class="form-check-label">${l.name} — ${l.nick}</label>
      </div>
    `;
  });
}

export function initSaveBlock() {
  document.getElementById("save-block").addEventListener("click", async () => {
    const id = document.getElementById("block-id").value;
    const ref = doc(db, "zapalovac", "2026", "blocks", id);
    const selected = [...document.querySelectorAll("#block-lectors input:checked")]
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

    // reload blocks
    window.loadBlocks?.(window.attachBlockHandlers);
  });
}
