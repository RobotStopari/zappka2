// root/admin/js/blocks.js

import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";
import { formatTime } from "./utils.js";
import { allLectors } from "./lectorsData.js";

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

  // Helper function to calculate duration
  function getDuration(start, end) {
    if (!end) return "";
    const startDate = start.toDate();
    const endDate = end.toDate();
    const diffMs = endDate - startDate;
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  // Helper function to format time in European format (24h)
  function formatTimeEU(ts) {
    return ts.toDate().toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  // Helper function to create lector bubbles
  function getLectorBubbles(lectors) {
    if (!lectors || lectors.length === 0) return "";

    return lectors.map(lect => {
      let lector;

      // Handle if lector is a reference object with id property
      if (typeof lect === 'object' && lect.id) {
        lector = allLectors.find(l => l.id === lect.id);
      } else if (typeof lect === 'string') {
        // If it's just an ID string
        lector = allLectors.find(l => l.id === lect);
      }

      if (!lector || !lector.color) return "";
      const name = lector.name || "Lector";
      const nick = lector.nick || "";
      const displayText = nick ? `${nick} – ${name}` : name;
      return `<div class="lector-bubble" style="background-color: ${lector.color}" data-nick="${nick}" data-name="${name}" data-display="${displayText}"></div>`;
    }).join("");
  }

  // Load all lectors for color reference
  const lectorsDoc = await getDocs(collection(db, "zapalovac", "2026", "lectors"));
  const lectorsData = {};
  lectorsDoc.forEach(doc => {
    lectorsData[doc.id] = doc.data();
  });

  Object.keys(days).sort().forEach(date => {
    const card = document.createElement("div");
    card.className = "card card-admin fade-in mb-4";

    // Format the date nicely
    const dateObj = new Date(date + "T00:00:00");
    const dateFormatted = dateObj.toLocaleDateString("cs-CZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    card.innerHTML = `
      <div class="card-header card-header-admin">
        <i class="fas fa-calendar-days"></i> ${dateFormatted}
      </div>
      <div class="card-body p-0">
        <div class="blocks-list">
          ${days[date].map(b => `
            <div class="block-item" data-id="${b.id}">
              <div class="block-header">
                <h6 class="block-title">${b.name || "(no title)"}</h6>
                <span class="block-type-label">${b.type || "Block"}</span>
              </div>
              ${b.topic ? `<p class="block-topic"><i class="fas fa-bookmark"></i> ${b.topic}</p>` : ""}
              <div class="block-meta">
                <i class="fas fa-clock"></i>
                <span class="block-time">${formatTimeEU(b.start)} ${b.end ? "– " + formatTimeEU(b.end) : ""}</span>
                ${getDuration(b.start, b.end) ? `<span class="block-duration">${getDuration(b.start, b.end)}</span>` : ""}
              </div>
              ${b.lectors && Array.isArray(b.lectors) && b.lectors.length > 0 ? `
                <div class="block-lectors">
                  ${getLectorBubbles(b.lectors)}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  attachBlockHandlers();
}
