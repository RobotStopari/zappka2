// root/admin/js/blocks.js

import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";
import { formatTime } from "./utils.js";

export async function loadBlocks(attachBlockHandlers) {
  const container = document.getElementById("days-container");
  container.innerHTML = "";

  const q = query(collection(db, "zapalovac", "2026", "blocks"), orderBy("start"));
  const snap = await getDocs(q);

  const days = {};
  snap.forEach(d => {
    const b = d.data();
    const dateKey = b.start.toDate().toISOString().slice(0, 10);
    if (!days[dateKey]) days[dateKey] = [];
    days[dateKey].push({ id: d.id, ...b });
  });

  Object.keys(days).sort().forEach(date => {
    const card = document.createElement("div");
    card.className = "card mb-3 fade-in";
    card.innerHTML = `
      <div class="card-header fw-semibold">${date}</div>
      <ul class="list-group list-group-flush">
        ${days[date].map(b => `
          <li class="list-group-item block-item" data-id="${b.id}">
            <strong>${b.name || "(no title)"}</strong>
            <div class="text-muted small">
              ${formatTime(b.start)} ${b.end ? "– " + formatTime(b.end) : ""}
            </div>
          </li>
        `).join("")}
      </ul>
    `;
    container.appendChild(card);
  });

  attachBlockHandlers();
}
