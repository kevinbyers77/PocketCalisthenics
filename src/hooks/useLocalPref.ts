import { useEffect, useState } from "react";
import localforage from "localforage";

export function useLocalPref<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    let mounted = true;
    localforage.getItem<T>(key).then(v => { if (mounted && v != null) setValue(v); });
    return () => { mounted = false; };
  }, [key]);
  useEffect(() => { localforage.setItem(key, value).catch(() => {}); }, [key, value]);
  return [value, setValue] as const;
}
