import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCK5f-LS66GEvfkExY1hJ8VoqhVep7TQGs",
  authDomain: "unionai-3635b.firebaseapp.com",
  projectId: "unionai-3635b",
  storageBucket: "unionai-3635b.firebasestorage.app",
  messagingSenderId: "710777064413",
  appId: "1:710777064413:web:2cf432f30ee537b9a38434",
};

let app: FirebaseApp | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;

function logConfigDiagnostics() {
  const { apiKey, appId, messagingSenderId, projectId } = firebaseConfig;
  const problems: string[] = [];
  if (!apiKey) {
    problems.push("apiKey is empty");
  } else if (!/^AIzaSy/.test(apiKey)) {
    problems.push(`apiKey does not look like a Firebase key: "${apiKey}"`);
  }
  const appIdProject = appId?.split(":")?.[1];
  if (messagingSenderId && appIdProject && messagingSenderId !== appIdProject) {
    problems.push(
      `messagingSenderId (${messagingSenderId}) does not match the project number in appId (${appIdProject})`,
    );
  }
  const appIdSegments = appId?.split(":") ?? [];
  const appIdWebSegment = appIdSegments[2];
  const appIdHexSegment = appIdSegments[3];
  if (
    appId &&
    (appIdSegments[0] !== "1" ||
      appIdWebSegment !== "web" ||
      !/^[0-9a-f]+$/i.test(appIdHexSegment ?? ""))
  ) {
    problems.push(`appId does not match the expected Firebase web format: "${appId}"`);
  }
  if (!projectId) {
    problems.push("projectId is empty");
  }
  if (problems.length) {
    console.warn("[firebase] Configuration diagnostics:", problems);
  }
}

export async function ensureFirebase(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  if (app && messaging) {
    return true;
  }
  logConfigDiagnostics();
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    const supported = await isSupported();
    if (supported === true) {
      messaging = getMessaging(app);
    }
    return !!messaging;
  } catch (error: any) {
    console.error("[firebase] Messaging initialization failed:", error);
    app = null;
    messaging = null;
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const ok = await ensureFirebase();
    if (!ok || !messaging) {
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    const permission =
      typeof Notification !== "undefined" ? Notification.permission : "unsupported";
    if (permission === "denied") {
      console.warn("[firebase] Notification permission is denied.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("[firebase] Service workers are unavailable in this browser.");
      return null;
    }
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    const token = await getToken(messaging, {
      serviceWorkerRegistration,
      ...(vapidKey ? { vapidKey } : {}),
    });
    return token || null;
  } catch (error: any) {
    console.error("[firebase] FCM token registration failed:", error);
    return null;
  }
}

export async function deleteFcmToken(): Promise<boolean> {
  try {
    const ok = await ensureFirebase();
    if (!ok || !messaging) return false;
    return await deleteToken(messaging);
  } catch (error: any) {
    console.error("[firebase] FCM token deletion failed:", error);
    return false;
  }
}

export function onForegroundMessage(
  handler: (payload: any) => void,
): () => void {
  let unsubscribe: (() => void) | null = null;
  let active = true;
  ensureFirebase()
    .then((ok) => {
      if (!active || !ok || !messaging) {
        return;
      }
      unsubscribe = onMessage(messaging, handler);
    })
    .catch((error) => {
      console.error("[firebase] onForegroundMessage setup failed:", error);
    });
  return () => {
    active = false;
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
