import { useEffect, useState } from "react";

const VERSION = 2;

const warn = (message, error) => {
  console.warn(`DreamyScape: ${message}`, error);
};

// Accepts both the v1 bare array and the v2 { version, items } envelope.
const parseStored = (raw) => {
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed?.items;
  return Array.isArray(items) ? items : null;
};

const readStored = (key, fallback, normalize) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const items = parseStored(raw);
    if (!items) return fallback;

    return normalize ? normalize(items) : items;
  } catch (error) {
    warn(`could not read "${key}" from localStorage`, error);
    return fallback;
  }
};

export function useLocalStorage(key, initialValue = [], options = {}) {
  const { normalize } = options;

  // The initializer only runs on mount, so normalizing here also migrates data
  // that was saved before these fields existed.
  const [value, setValue] = useState(() => readStored(key, initialValue, normalize));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: VERSION, items: value }));
    } catch (error) {
      warn(`could not write "${key}" to localStorage`, error);
    }
  }, [key, value]);

  // Another tab changed this key: adopt its value instead of overwriting it later.
  // Every DreamyScape key holds an array, so clearing one resets to an empty list.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return;

      if (event.newValue === null) {
        setValue([]);
        return;
      }

      try {
        const items = parseStored(event.newValue);
        if (items) setValue(normalize ? normalize(items) : items);
      } catch (error) {
        warn(`could not sync "${key}" from another tab`, error);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, normalize]);

  return [value, setValue];
}

export const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Fills in fields added after a goal was first saved.
export const normalizeGoal = (goals) =>
  goals
    .filter((goal) => goal && typeof goal === "object")
    .map((goal) => ({
      dreamId: null,
      completedAt: goal.completed ? (goal.completedAt ?? null) : null,
      ...goal,
    }));

// Fills in fields added after a dream was first saved.
export const normalizeDream = (dreams) =>
  dreams
    .filter((dream) => dream && typeof dream === "object")
    .map((dream) => ({
      createdAt: null,
      ...dream,
    }));

export const STORAGE_KEYS = {
  goals: "dreamyscape-goals",
  dreams: "dreamyscape-dreams",
};
