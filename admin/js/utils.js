// root/admin/js/utils.js

export function formatTime(ts) {
  return ts.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function toLocal(ts) {
  return ts.toDate().toISOString().slice(0, 16);
}
