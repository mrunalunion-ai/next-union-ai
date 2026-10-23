import { initializeApp, type FirebaseApp } from "firebase/app";
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
  if (appId && !/^[0-9a-f]+$/i.test(appId?.split(":")?.[2] ?? "")) {
    problems.push(`appId web segment is not hex: "${appId}"`);
  }
  if (!projectId) {
    problems.push("projectId is empty");
  }
  if (problems.length > 0) {
    console.warn("[firebase] ⚠️ config issues:", problems);
  } else {
    console.info(
      "[firebase] config looks OK:",
      JSON.stringify({ projectId, messagingSenderId }),
    );
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
    app = initializeApp(firebaseConfig);

    const supported = await isSupported();
    if (supported === true) {
      messaging = getMessaging(app);
    }
    return !!messaging;
  } catch (error: any) {
    console.error("[firebase] ❌ init failed:", error?.code, error?.message || error);
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
      console.warn(
        "[firebase] Permission denied. Enable notifications for this site in the browser settings.",
      );
      return null;
    }

    const token = await getToken(
      messaging,
      vapidKey ? { vapidKey } : undefined,
    );
    return token || null;
  } catch (error: any) {
    console.error(
      "[firebase] ❌ getToken() failed:",
      error?.code,
      error?.message || error,
    );
    return null;
  }
}

export async function deleteFcmToken(): Promise<boolean> {
  try {
    const ok = await ensureFirebase();
    if (!ok || !messaging) return false;
    return await deleteToken(messaging);
  } catch (error: any) {
    console.error("[firebase] Failed to delete FCM token:", error?.code, error?.message || error);
    return false;
  }
}

export function onForegroundMessage(
  handler: (payload: any) => void,
): () => void {
  let unsubscribe: (() => void) | null = null;
  ensureFirebase()
    .then((ok) => {
      if (!ok || !messaging) {
        return;
      }
      unsubscribe = onMessage(messaging, handler);
    })
    .catch((error) => {
      console.error("[firebase] onForegroundMessage setup failed:", error);
    });
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
