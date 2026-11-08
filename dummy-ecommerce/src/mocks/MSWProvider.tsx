"use client";
import { useEffect, useState } from "react";

let startPromise: Promise<void> | undefined;
function startMsw() {
  return (startPromise ??= import("./browser").then(async ({ worker }) => {
    await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  }));
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    async function initialize() {
      // The explicit switch is for API/UI and network tests, where auth mocks
      // are not used. It prevents attempting a blocked Service Worker startup.
      const bypass =
        new URLSearchParams(window.location.search).get("e2eNoMsw") === "1";
      try {
        if (!bypass) await startMsw();
        else await Promise.resolve();
        if (active) setIsReady(true);
      } catch {
        if (active) setError(true);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <p role="alert">
        Unable to start the demo API. Reload the page to try again.
      </p>
    );
  if (!isReady) return <p className="p-8 text-center">Loading...</p>;
  return <>{children}</>;
}
