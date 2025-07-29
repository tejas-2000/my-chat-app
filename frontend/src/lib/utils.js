export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function showBrowserNotification(title, options) {
  if (window.Notification && Notification.permission === "granted") {
    new Notification(title, options);
  }
}
