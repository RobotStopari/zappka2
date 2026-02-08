// root/admin/js/lectorsData.js
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";

export let allLectors = [];

export async function loadLectorsFromDB() {
  const snap = await getDocs(collection(db, "zapalovac", "2026", "lectors"));
  return snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
}

export async function preloadLectors() {
  allLectors = await loadLectorsFromDB();
}

export async function addLector({ nick, name, color }) {
  if (!name) return; // require at least a name
  await addDoc(collection(db, "zapalovac", "2026", "lectors"), { nick, name, color });
  await preloadLectors();
}

export async function updateLector(id, { nick, name, color }) {
  const ref = doc(db, "zapalovac", "2026", "lectors", id);
  await updateDoc(ref, { nick, name, color });
  await preloadLectors();
}

export async function deleteLector(id) {
  const ref = doc(db, "zapalovac", "2026", "lectors", id);
  await deleteDoc(ref);
  await preloadLectors();
}

export async function getLector(id) {
  const ref = doc(db, "zapalovac", "2026", "lectors", id);
  const snap = await getDoc(ref);
  return snap.data();
}
