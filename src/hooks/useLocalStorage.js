import { useEffect, useState } from "react";

import { useAuth } from "../context/auth-context";

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

const readStored = (key, fallback, normalize, legacyKey) => {
  try {
    let raw = window.localStorage.getItem(key);

    // First sign-in on this device: adopt what was saved before accounts existed
    // so nobody's goals appear to vanish the moment they log in.
    if (!raw && legacyKey) {
      const legacy = window.localStorage.getItem(legacyKey);
      if (legacy) {
        window.localStorage.setItem(key, legacy);
        window.localStorage.removeItem(legacyKey);
        raw = legacy;
      }
    }

    if (!raw) return fallback;

    const items = parseStored(raw);
    if (!items) return fallback;

    return normalize ? normalize(items) : items;
  } catch (error) {
    warn(`could not read "${key}" from localStorage`, error);
    return fallback;
  }
};

// Fired on every write so other components reading the same key in this tab
// (including a restored backup) see the change without a page reload.
export const SYNC_EVENT = "dreamyscape:storage";

// Signed-in accounts get their own copy of a key on this device; guests keep
// using the plain key, which is also what a first sign-in migrates from.
export const scopedStorageKey = (key, uid) => (uid ? `${key}:${uid}` : key);

export const announceStorage = (key, items) => {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, items } }));
};

export function useLocalStorage(key, initialValue = [], options = {}) {
  const { normalize } = options;

  const { user } = useAuth();
  const scopedKey = scopedStorageKey(key, user?.uid);
  const legacyKey = user?.uid ? key : null;

  // The initializer only runs on mount, so normalizing here also migrates data
  // that was saved before these fields existed. App remounts when the signed-in
  // user changes, so this never reads one account's data into another's.
  const [value, setValue] = useState(() =>
    readStored(scopedKey, initialValue, normalize, legacyKey),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(scopedKey, JSON.stringify({ version: VERSION, items: value }));
      announceStorage(scopedKey, value);
    } catch (error) {
      warn(`could not write "${scopedKey}" to localStorage`, error);
    }
  }, [scopedKey, value]);

  // Another hook instance (or a restore) wrote this key in the same tab. Only
  // adopt it when the content actually differs, so the write above cannot echo
  // back and forth between two components forever.
  useEffect(() => {
    const onSync = (event) => {
      const detail = event.detail;
      if (!detail || detail.key !== scopedKey || !Array.isArray(detail.items)) return;

      setValue((current) => {
        const next = normalize ? normalize(detail.items) : detail.items;
        return JSON.stringify(current) === JSON.stringify(next) ? current : next;
      });
    };

    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [scopedKey, normalize]);

  // Another tab changed this key: adopt its value instead of overwriting it later.
  // Every DreamyScape key holds an array, so clearing one resets to an empty list.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== scopedKey) return;

      if (event.newValue === null) {
        setValue([]);
        return;
      }

      try {
        const items = parseStored(event.newValue);
        if (items) setValue(normalize ? normalize(items) : items);
      } catch (error) {
        warn(`could not sync "${scopedKey}" from another tab`, error);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [scopedKey, normalize]);

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
      notes: "",
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

// Videos are stored as links, so only the fields around the link need defaults.
export const normalizeVideo = (videos) =>
  videos
    .filter((video) => video && typeof video === "object" && typeof video.url === "string")
    .map((video) => ({
      title: "Video",
      addedAt: null,
      ...video,
    }));

export const STORAGE_KEYS = {
  goals: "dreamyscape-goals",
  dreams: "dreamyscape-dreams",
  videos: "dreamyscape-videos",
};
