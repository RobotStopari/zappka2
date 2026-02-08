import { initAuthGuard } from "./authGuard.js";
import { renderLectors, openLectorPopup } from "./lectorsUI.js";
import { initLectorFormHandlers, initAddLectorForm } from "./lectorsForm.js";
import { loadBlocks } from "./blocks.js";
import { openBlock, initSaveBlock } from "./blockModal.js";

async function initAdmin() {
  await renderLectors();
  initAddLectorForm();

  // Blocks
  window.attachBlockHandlers = () => {
    document.querySelectorAll(".block-item").forEach(el => {
      el.addEventListener("click", () => openBlock(el.dataset.id));
    });
  };
  await loadBlocks(window.attachBlockHandlers);
  initSaveBlock();
}

initAuthGuard(initAdmin);
