// Photos are too big for localStorage, so they live in IndexedDB as
// downscaled JPEG data URLs (easy to render and to print, no object URLs to
// revoke). Each record carries an owner so accounts stay separate.
const DB_NAME = "dreamyscape";
const DB_VERSION = 1;
const STORE = "photos";

const MAX_EDGE = 1600;
const QUALITY = 0.86;

let dbPromise = null;

const openDb = () => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("This browser can't store photos."));
  }

  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open photo storage."));
  });

  return dbPromise;
};

const newId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}.`));
    };
    image.src = url;
  });

// Shrinks a file to something that prints well without filling the browser.
const toPhotoSource = async (file) => {
  const image = await readImage(file);
  const longest = Math.max(image.width, image.height) || 1;
  const scale = Math.min(1, MAX_EDGE / longest);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't process photos.");

  // Photos with transparency get a white backing rather than turning black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    src: canvas.toDataURL("image/jpeg", QUALITY),
    width: canvas.width,
    height: canvas.height,
  };
};

// Runs one transaction and resolves once it has actually committed.
const run = async (mode, action) => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    let result;

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error ?? new Error("Photo storage failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Photo storage was cancelled."));

    try {
      result = action(transaction.objectStore(STORE));
    } catch (error) {
      transaction.abort();
      reject(error);
    }
  });
};

export const listPhotos = async (owner) => {
  let records = [];

  await run("readonly", (store) => {
    const request = store.getAll();
    request.onsuccess = () => {
      records = request.result;
    };
    return null;
  });

  return records
    .filter((photo) => photo.owner === owner)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((photo) => ({ dreamId: null, cover: false, ...photo }));
};

export const addPhotos = async (owner, files) => {
  const records = [];

  for (const [index, file] of [...files].entries()) {
    const source = await toPhotoSource(file);
    records.push({
      id: newId(),
      owner,
      name: file.name.replace(/\.[^.]+$/, "") || "Photo",
      createdAt: Date.now() - index,
      liked: false,
      dreamId: null,
      cover: false,
      ...source,
    });
  }

  await run("readwrite", (store) => {
    records.forEach((record) => store.put(record));
    return null;
  });

  return records;
};

export const savePhoto = (photo) =>
  run("readwrite", (store) => {
    store.put(photo);
    return null;
  });

// Saves several photos at once, so choosing a cover can clear the old one in
// the same transaction.
export const savePhotos = (photos) =>
  run("readwrite", (store) => {
    photos.forEach((photo) => store.put(photo));
    return null;
  });

export const deletePhoto = (id) =>
  run("readwrite", (store) => {
    store.delete(id);
    return null;
  });

// Points a batch of photos at one dream (or at none), used when a dream is
// removed so no photo is left pointing at something that no longer exists.
export const setPhotosDream = (ids, dreamId) =>
  run("readwrite", (store) => {
    ids.forEach((id) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const photo = request.result;
        if (photo) store.put({ ...photo, dreamId });
      };
    });
    return null;
  });
