/* global importScripts, firebase */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCK5f-LS66GEvfkExY1hJ8VoqhVep7TQGs",
  authDomain: "unionai-3635b.firebaseapp.com",
  projectId: "unionai-3635b",
  storageBucket: "unionai-3635b.firebasestorage.app",
  messagingSenderId: "710777064413",
  appId: "1:710777064413:web:2cf432f30ee537b9a38434",
});

const messaging = firebase.messaging();
const origin = self.location.origin;

// Collapse duplicate deliveries of the same message within a short window.
// (e.g. when the server still holds more than one token for this device)
const DEDUP_WINDOW_MS = 60 * 1000;
const recentMessageIds = new Map();

function parseData(payload) {
  const data = payload?.data || {};
  let meta = {};
  try {
    meta = JSON.parse(data.payload || "{}");
  } catch {
    // payload.data.payload is not JSON — ignore
  }
  return { data, meta };
}

messaging.onBackgroundMessage((payload) => {
  const { data, meta } = parseData(payload);
  const notification = payload?.notification || {};
  const messageId = String(
    meta.notificationId || data.messageId || payload.messageId || "",
  );
  const now = Date.now();

  console.info("[SW] 📬 background message received", {
    messageId: messageId || "(none)",
    title: notification.title || "(no title)",
    hasNotificationBlock: Boolean(notification.title || notification.body),
    dataKeys: Object.keys(data),
  });

  if (messageId) {
    const lastSeen = recentMessageIds.get(messageId);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
      console.info(`[SW] ⏭ skipping duplicate messageId=${messageId}`);
      return;
    }
    recentMessageIds.set(messageId, now);
    if (recentMessageIds.size > 50) {
      const oldestKey = recentMessageIds.keys().next().value;
      recentMessageIds.delete(oldestKey);
    }
  }

  console.info("[SW] 🔔 showing notification:", {
    messageId: messageId || "(none)",
    title: notification.title || "UnionAI",
    icon: `${origin}/assets/images/logo-badge.svg`,
    tag: messageId || "(none)",
  });

  self.registration.showNotification(notification.title || "UnionAI", {
    body: notification.body || "",
    icon: `${origin}/assets/images/logo-badge.svg`,
    badge: `${origin}/assets/images/logo-badge.svg`,
    tag: messageId || undefined,
    data: payload.data || {},
  });
});