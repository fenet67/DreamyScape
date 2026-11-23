// Everything DreamyScape saves lives in this browser, so a single file is the
// only way to survive cleared site data or to move to another device.
import {
  STORAGE_KEYS,
  announceStorage,
  normalizeDream,
  normalizeGoal,
  normalizeVideo,
  scopedStorageKey,
} from "../hooks/useLocalStorage";
import { listPhotos, savePhotos } from "./photoStore";

export const BACKUP_FORMAT = "dreamyscape-backup";
export const BACKUP_VERSION = 1;

const readItems = (storedKey) => {
  try {
    const raw = window.localStorage.getItem(storedKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const writeItems = (storedKey, items) => {
  window.localStorage.setItem(storedKey, JSON.stringify({ version: 2, items }));
};

export const collectBackup = async (uid) => ({
  format: BACKUP_FORMAT,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  goals: readItems(scopedStorageKey(STORAGE_KEYS.goals, uid)),
  dreams: readItems(scopedStorageKey(STORAGE_KEYS.dreams, uid)),
  videos: readItems(scopedStorageKey(STORAGE_KEYS.videos, uid)),
  photos: await listPhotos(uid ?? "guest"),
});

export const backupFileName = () => {
  const stamp = new Date().toISOString().slice(0, 10);
  return `dreamyscape-backup-${stamp}.json`;
};

export const downloadBackup = (backup) => {
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = backupFileName();
  document.body.append(link);
  link.click();
  link.remove();

  // Revoking straight away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Throws a message meant for the person reading the screen.
export const parseBackup = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a JSON backup — try the file DreamyScape downloaded.");
  }

  if (!parsed || parsed.format !== BACKUP_FORMAT) {
    throw new Error("That doesn't look like a DreamyScape backup file.");
  }

  if (parsed.version !== BACKUP_VERSION) {
    throw new Error(
      `This backup is version ${parsed.version}, but this page reads version ${BACKUP_VERSION}.`,
    );
  }

  const list = (value) => (Array.isArray(value) ? value : []);

  return {
    goals: list(parsed.goals),
    dreams: list(parsed.dreams),
    videos: list(parsed.videos),
    photos: list(parsed.photos).filter(
      (photo) => photo && typeof photo.id === "string" && typeof photo.src === "string",
    ),
  };
};

// Additive on purpose: nothing already in this browser is replaced or removed,
// so restoring the wrong file can never destroy real data.
export const restoreBackup = async (uid, incoming) => {
  const owner = uid ?? "guest";
  const added = { goals: 0, dreams: 0, videos: 0, photos: 0 };

  const merge = (base, list, normalize) => {
    const storedKey = scopedStorageKey(base, uid);
    const current = normalize(readItems(storedKey));
    const seen = new Set(current.map((item) => item.id));

    const fresh = normalize(list).filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    if (fresh.length === 0) return 0;

    const merged = [...current, ...fresh];
    writeItems(storedKey, merged);
    announceStorage(storedKey, merged);
    return fresh.length;
  };

  added.goals = merge(STORAGE_KEYS.goals, incoming.goals, normalizeGoal);
  added.dreams = merge(STORAGE_KEYS.dreams, incoming.dreams, normalizeDream);
  added.videos = merge(STORAGE_KEYS.videos, incoming.videos, normalizeVideo);

  // Photos keep the id from the file but always belong to this browser's owner,
  // so a guest backup restored into an account lands in that account.
  const existing = new Set((await listPhotos(owner)).map((photo) => photo.id));
  const freshPhotos = incoming.photos
    .filter((photo) => !existing.has(photo.id))
    .map((photo) => ({
      dreamId: null,
      cover: false,
      liked: false,
      name: "Photo",
      createdAt: photo.createdAt ?? Date.now(),
      ...photo,
      owner,
    }));

  await savePhotos(freshPhotos);
  added.photos = freshPhotos.length;

  return added;
};
