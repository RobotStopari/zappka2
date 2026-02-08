import { initAuthGuard } from "./authGuard.js";
import { renderLectors, openLectorPopup } from "./lectorsUI.js";
import { initLectorFormHandlers, initAddLectorForm } from "./lectorsForm.js";
import { loadBlocks } from "./blocks.js";
import { openBlock, initSaveBlock } from "./blockModal.js";
import { addBlock } from "./blockData.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function initAdmin() {
  await renderLectors();
  initAddLectorForm();

  // Blocks
  window.attachBlockHandlers = () => {
    document.querySelectorAll(".block-item").forEach(el => {
      el.addEventListener("click", () => openBlock(el.dataset.id));
    });
  };
  window.loadBlocks = loadBlocks;
  await loadBlocks(window.attachBlockHandlers);
  initSaveBlock();

  // Add block button
  document.getElementById("add-block-btn").addEventListener("click", async () => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

    const newBlockId = await addBlock({
      name: "",
      topic: "",
      type: "",
      desc: "",
      start: Timestamp.fromDate(now),
      end: Timestamp.fromDate(end),
      lectors: []
    });

    const scrollPos = window.scrollY;
    await window.loadBlocks?.(window.attachBlockHandlers);
    setTimeout(() => window.scrollTo(0, scrollPos), 50);
    await openBlock(newBlockId, true);
  });
}

initAuthGuard(initAdmin);
