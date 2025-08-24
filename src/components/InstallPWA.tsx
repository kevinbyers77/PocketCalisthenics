import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onAppInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: 16, right: 16, margin: "0 auto",
        maxWidth: 720, background: "#111827", color: "white", padding: 12,
        borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
      }}
    >
      <span>Install Pocket Calisthenics?</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={async () => { await deferred.prompt(); const _ = await deferred.userChoice; setDeferred(null); }}
          style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
        >
          Install
        </button>
        <button
          onClick={() => setDeferred(null)}
          style={{ background: "transparent", color: "white", border: "1px solid #555", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
