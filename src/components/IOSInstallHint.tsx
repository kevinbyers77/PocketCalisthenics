import { useEffect, useState } from "react";

const DISMISS_KEY = "pc:iosInstallHint:dismissed";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  // iOS Safari exposes navigator.standalone; others expose display-mode
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    // @ts-ignore
    (!!(navigator as any).standalone)
  );
}

export default function IOSInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide if user already dismissed
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    // If Android/desktop shows beforeinstallprompt, let that flow handle it
    const onBIP = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onBIP);

    // Show only on iOS Safari, not already installed
    if (isIOS() && !isStandalone()) {
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        margin: "0 auto",
        maxWidth: 720,
        background: "#111827",
        color: "white",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 50
      }}
    >
      <div style={{ lineHeight: 1.3 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Install on iPhone/iPad</div>
        <div style={{ opacity: 0.9, fontSize: 14 }}>
          Tap <span aria-label="Share">Share</span> <span style={{fontSize:18}}>▵</span> then
          <strong> Add to Home Screen</strong>.
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        aria-label="Dismiss install hint"
        style={{
          marginLeft: "auto",
          background: "transparent",
          color: "white",
          border: "1px solid #555",
          padding: "6px 10px",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
