const BUILD_KEY = "unionai_build_id";

/** Clear app session data without removing the build marker used by Redux startup. */
export function clearBrowserSessionStorage() {
  const buildId = window.localStorage.getItem(BUILD_KEY);

  window.localStorage.clear();
  if (buildId) {
    window.localStorage.setItem(BUILD_KEY, buildId);
  }

  window.sessionStorage.clear();
}
