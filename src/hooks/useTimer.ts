import { useEffect, useRef, useState } from "react";

export function useTimer(totalSeconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState<number>(Math.max(0, totalSeconds));
  const [running, setRunning] = useState<boolean>(false);
  const idRef = useRef<number | null>(null);

  const clear = () => {
    if (idRef.current !== null) {
      clearInterval(idRef.current);
      idRef.current = null;
    }
  };

  const startInterval = () => {
    clear(); // ensure only one interval exists
    idRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clear();
          setRunning(false);
          onDone?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Start/stop interval when running changes
  useEffect(() => {
    if (running) startInterval();
    else clear();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, onDone]);

  // When totalSeconds changes (e.g., new segment), reset remaining
  // and keep the timer running if it was already running.
  useEffect(() => {
    setRemaining(Math.max(0, totalSeconds));
    if (running) startInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  // Cleanup on unmount
  useEffect(() => clear, []);

  return {
    remaining,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (s = totalSeconds) => {
      clear();
      setRunning(false);
      setRemaining(Math.max(0, s));
    },
  };
}
