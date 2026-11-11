import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowUpTray,
  HiOutlineHeart,
  HiOutlinePhoto,
  HiOutlinePrinter,
  HiOutlineSparkles,
  HiOutlineTrash,
} from "react-icons/hi2";

import UndoToast from "../components/UndoToast";
import { useAuth } from "../context/auth-context";
import { addPhotos, deletePhoto, listPhotos, savePhoto } from "../lib/photoStore";

const SUGGESTION_SIZE = 6;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "liked", label: "Liked" },
];

const Photos = () => {
  const { user } = useAuth();
  const owner = user?.uid ?? "guest";

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState("");
  const [undo, setUndo] = useState(null);

  const [printedOn] = useState(() => new Date().toLocaleDateString());

  const undoTimer = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    let active = true;

    listPhotos(owner)
      .then((records) => {
        if (active) setPhotos(records);
      })
      .catch((caught) => {
        if (active) setError(caught.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [owner]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const upload = async (fileList) => {
    const files = [...(fileList ?? [])].filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Those files aren't images — try a JPG, PNG or WebP.");
      return;
    }

    setError("");
    setBusy(true);
    try {
      const created = await addPhotos(owner, files);
      setPhotos((current) => [...created, ...current]);
      setNote("");
    } catch (caught) {
      setError(
        caught?.name === "QuotaExceededError"
          ? "This browser is out of space for photos. Remove a few and try again."
          : caught.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleLiked = async (photo) => {
    const next = { ...photo, liked: !photo.liked };
    setPhotos((current) => current.map((item) => (item.id === photo.id ? next : item)));
    try {
      await savePhoto(next);
    } catch (caught) {
      setError(caught.message);
    }
  };

  const toggleSelected = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setNote("");
  };

  const clearSelection = () => {
    setSelected([]);
    setNote("");
  };

  // Favorites first, then whatever was added most recently.
  const suggest = () => {
    const picks = [...photos.filter((photo) => photo.liked), ...photos.filter((photo) => !photo.liked)]
      .slice(0, SUGGESTION_SIZE)
      .map((photo) => photo.id);

    setSelected(picks);
    setNote(
      picks.length === 0
        ? "Upload a few photos and a set will be picked for you."
        : `Picked ${picks.length} for you — favorites first, then the newest.`,
    );
  };

  const remove = async (photo) => {
    const index = photos.findIndex((item) => item.id === photo.id);

    try {
      await deletePhoto(photo.id);
    } catch (caught) {
      setError(caught.message);
      return;
    }

    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    setSelected((current) => current.filter((id) => id !== photo.id));
    clearTimeout(undoTimer.current);
    setUndo({ photo, index });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const undoRemove = async () => {
    if (!undo) return;

    clearTimeout(undoTimer.current);
    try {
      await savePhoto(undo.photo);
      setPhotos((current) => {
        const next = [...current];
        next.splice(Math.min(undo.index, next.length), 0, undo.photo);
        return next;
      });
    } catch (caught) {
      setError(caught.message);
    }
    setUndo(null);
  };

  const dismissUndo = () => {
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const visible = filter === "liked" ? photos.filter((photo) => photo.liked) : photos;
  const printed = photos.filter((photo) => selected.includes(photo.id));
  const likedCount = photos.filter((photo) => photo.liked).length;

  const print = () => {
    if (printed.length > 0) window.print();
  };

  return (
    <>
      <div className="container-page py-14 max-w-5xl print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Photos</h1>
            <p className="text-ink-soft mt-2">
              The pictures behind the dreams — keep the ones that pull you forward.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="btn-primary"
          >
            <HiOutlineArrowUpTray size={18} aria-hidden="true" />
            {busy ? "Adding photos…" : "Upload photos"}
          </button>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Choose photos to upload"
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            upload(event.dataTransfer.files);
          }}
          className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? "border-gold bg-gold-tint/60" : "border-line bg-surface/60"
          }`}
        >
          <HiOutlinePhoto size={26} className="mx-auto text-gold-deep" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold">Drag photos here</p>
          <p className="mt-1 text-xs text-ink-soft">
            JPG, PNG or WebP. They're resized and saved in this browser — nothing is uploaded.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-clay/10 px-3 py-2 text-sm font-semibold text-bloom"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-ink-soft" role="status">
            Loading your photos…
          </p>
        ) : photos.length === 0 ? (
          <div className="card mt-8 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-tint text-violet">
              <HiOutlinePhoto size={22} aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-lg mb-1">No photos yet</h2>
            <p className="text-ink-soft text-sm">
              Upload images of the places, people and things you're working toward.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2" role="group" aria-label="Filter photos">
                {FILTERS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    aria-pressed={filter === id}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      filter === id
                        ? "bg-gold text-[#33200f]"
                        : "border border-line text-ink-soft hover:border-caramel hover:text-ink"
                    }`}
                  >
                    {label}
                    <span className="ml-1.5 opacity-70">
                      {id === "all" ? photos.length : likedCount}
                    </span>
                  </button>
                ))}
              </div>

              <span className="flex-1" />

              <button
                type="button"
                onClick={suggest}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                <HiOutlineSparkles size={16} aria-hidden="true" />
                Suggest a set
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={print}
                disabled={printed.length === 0}
                className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
              >
                <HiOutlinePrinter size={16} aria-hidden="true" />
                Print{printed.length > 0 ? ` (${printed.length})` : ""}
              </button>
            </div>

            {note && (
              <p className="mt-3 text-xs font-semibold text-gold-deep" role="status">
                {note}
              </p>
            )}

            {visible.length === 0 ? (
              <div className="card mt-6 p-8 text-center">
                <p className="text-ink-soft mb-4">Nothing liked yet — tap a heart to keep it.</p>
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="btn-secondary !px-5 !py-2 text-sm"
                >
                  Show all photos
                </button>
              </div>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((photo) => {
                  const isSelected = selected.includes(photo.id);

                  return (
                    <li
                      key={photo.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-surface ${
                        isSelected ? "border-gold ring-2 ring-gold/40" : "border-line"
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.name}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />

                      <div className="absolute right-2 top-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleLiked(photo)}
                          aria-pressed={photo.liked}
                          aria-label={photo.liked ? `Unlike ${photo.name}` : `Like ${photo.name}`}
                          className={`rounded-full p-2 shadow-card transition-colors ${
                            photo.liked
                              ? "bg-gold text-ink"
                              : "bg-surface/90 text-ink-soft hover:text-ink"
                          }`}
                        >
                          <HiOutlineHeart size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(photo)}
                          aria-label={`Delete ${photo.name}`}
                          className="rounded-full bg-surface/90 p-2 text-ink-soft shadow-card transition-colors hover:text-bloom"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelected(photo.id)}
                            aria-label={`Include ${photo.name} in the print sheet`}
                            className="h-4 w-4 accent-gold"
                          />
                          Print
                        </label>
                        {photo.liked && (
                          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
                            Liked
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        <UndoToast
          message={undo ? `Deleted “${undo.photo.name}”` : ""}
          onUndo={undoRemove}
          onDismiss={dismissUndo}
        />
      </div>

      {/* Only rendered on paper, via the print media query. */}
      <div className="hidden print:block">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">DreamyScape</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">Photos to keep in view</h1>
          <p className="mt-1 text-xs text-ink-soft">
            {printed.length} photo{printed.length === 1 ? "" : "s"} · {printedOn}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {printed.map((photo) => (
            <figure key={photo.id} className="break-inside-avoid">
              <img src={photo.src} alt={photo.name} className="w-full rounded-lg object-cover" />
              <figcaption className="mt-1.5 text-xs text-ink-soft">{photo.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
};

export default Photos;
