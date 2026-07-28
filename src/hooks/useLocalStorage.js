import { useEffect, useState } from "react";


export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      
    }
  }, [key, value]);

  return [value, setValue];
}

export const STORAGE_KEYS = {
  goals: "dreamyscape-goals",
  dreams: "dreamyscape-dreams",
};