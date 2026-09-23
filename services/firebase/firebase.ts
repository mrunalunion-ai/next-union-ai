import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
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
    console.log("[firebase] Skipping init: window is undefined (SSR/build)");
    return false;
  }
  if (app && messaging) {
    console.log("[firebase] Already initialized");
    return true;
  }
  logConfigDiagnostics();
  try {
    console.log("[firebase] initializeApp() with projectId:", firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    console.log("[firebase] app initialized, name:", app.name);

    const supported = await isSupported();
    console.log("[firebase] messaging.isSupported() =>", supported);
    if (supported === true) {
      messaging = getMessaging(app);
      console.log("[firebase] getMessaging() OK");
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
  console.log("[firebase] getFcmToken() called");
  try {
    const ok = await ensureFirebase();
    if (!ok || !messaging) {
      console.log("[firebase] Aborting getFcmToken: Firebase messaging not ready");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    console.log(
      "[firebase] NEXT_PUBLIC_FIREBASE_VAPID_KEY configured:",
      Boolean(vapidKey),
      vapidKey ? `${String(vapidKey).slice(0, 8)}…` : "(none — getToken will likely fail on web)",
    );

    const permission =
      typeof Notification !== "undefined" ? Notification.permission : "unsupported";
    console.log("[firebase] Notification.permission =>", permission);
    if (permission === "denied") {
      console.warn(
        "[firebase] Permission denied. Enable notifications for this site in the browser settings.",
      );
      return null;
    }

    console.log("[firebase] Calling getToken()...");
    const token = await getToken(
      messaging,
      vapidKey ? { vapidKey } : undefined,
    );
    console.log(
      "[firebase] ✅ getToken() returned, length:",
      token?.length ?? 0,
      token ? `${token.slice(0, 16)}…` : "",
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

export function onForegroundMessage(
  handler: (payload: any) => void,
): () => void {
  let unsubscribe: (() => void) | null = null;
  console.log("[firebase] onForegroundMessage: subscribing…");
  ensureFirebase()
    .then((ok) => {
      if (!ok || !messaging) {
        console.log(
          "[firebase] onForegroundMessage: not subscribing (Firebase not ready)",
        );
        return;
      }
      unsubscribe = onMessage(messaging, handler);
      console.log(
        "[firebase] onForegroundMessage: subscribed — foreground pushes will toast",
      );
    })
    .catch((error) => {
      console.error("[firebase] onForegroundMessage setup failed:", error);
    });
  return () => {
    if (unsubscribe) {
      console.log("[firebase] onForegroundMessage: unsubscribed");
      unsubscribe();
    }
  };
}