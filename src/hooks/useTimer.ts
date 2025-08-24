import { useEffect, useRef, useState } from "react";

export function useTimer(totalSeconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const idRef = useRef<number | null>(null);

  useEffect(() => { setRemaining(totalSeconds); }, [totalSeconds]);

  useEffect(() => {
    if (!running) { if (idRef.current) clearInterval(idRef.current); return; }
    idRef.current = window.setInterval(() => {
      setRemaining(s => {
        if (s <= 1) {
          if (idRef.current) clearInterval(idRef.current);
          onDone?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (idRef.current) clearInterval(idRef.current); };
  }, [running, onDone]);

  return {
    remaining,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (s = totalSeconds) => { setRunning(false); setRemaining(s); }
  };
}
