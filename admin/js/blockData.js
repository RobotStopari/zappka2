// root/admin/js/blockData.js

import { collection, addDoc, deleteDoc, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";

export async function addBlock({ name, topic, type, desc, start, end, lectors }) {
  const ref = await addDoc(collection(db, "zapalovac", "2026", "blocks"), {
    name: name || "",
    topic: topic || "",
    type: type || "",
    desc: desc || "",
    start: start || Timestamp.now(),
    end: end || null,
    lectors: lectors || []
  });
  return ref.id;
}

export async function deleteBlock(id) {
  const ref = doc(db, "zapalovac", "2026", "blocks", id);
  await deleteDoc(ref);
}

export async function duplicateBlock(id) {
  const ref = doc(db, "zapalovac", "2026", "blocks", id);
  const snap = await getDoc(ref);
  const b = snap.data();

  // Create new block with same data but shifted 1 hour later
  const newStart = new Timestamp(b.start.seconds + 3600, b.start.nanoseconds);
  const newEnd = b.end ? new Timestamp(b.end.seconds + 3600, b.end.nanoseconds) : null;

  const newRef = await addDoc(collection(db, "zapalovac", "2026", "blocks"), {
    name: b.name,
    topic: b.topic,
    type: b.type,
    desc: b.desc,
    start: newStart,
    end: newEnd,
    lectors: b.lectors || []
  });

  return newRef.id;
}
