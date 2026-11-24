import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineFilm,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineVideoCamera,
} from "react-icons/hi2";

import UndoToast from "../components/UndoToast";
import {
  STORAGE_KEYS,
  createId,
  normalizeDream,
  normalizeVideo,
  useLocalStorage,
} from "../hooks/useLocalStorage";

// Turns a pasted link into something we know how to play. Returns null for
// anything else, so the form can say what it accepts.
const parseVideo = (raw) => {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? { kind: "youtube", id } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
      const id = parts[1];
      return id ? { kind: "youtube", id } : null;
    }
    const id = url.searchParams.get("v");
    return id ? { kind: "youtube", id } : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d+)/)?.[1];
    return id ? { kind: "vimeo", id } : null;
  }

  if (/\.(mp4|webm|ogv|ogg|m4v)$/i.test(url.pathname)) return { kind: "file" };

  return null;
};

const sourceLabel = (kind) =>
  kind === "youtube" ? "YouTube" : kind === "vimeo" ? "Vimeo" : "Video file";

const defaultTitle = (kind, url) => {
  if (kind === "youtube") return "YouTube video";
  if (kind === "vimeo") return "Vimeo video";
  const name = url.split("/").pop()?.replace(/\.[^.]+$/, "");
  return name || "Video";
};

const Poster = ({ video, title }) => {
  if (video.kind === "file") {
    return (
      <video
        src={video.url}
        controls
        preload="metadata"
        className="aspect-video w-full bg-black object-cover"
      />
    );
  }

  const embed =
    video.kind === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.id}`
      : `https://player.vimeo.com/video/${video.id}`;

  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
};

const Videos = () => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const [videos, setVideos] = useLocalStorage(STORAGE_KEYS.videos, [], {
    normalize: normalizeVideo,
  });
  // A video can belong to a dream, the same way photos and goals do.
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, [], { normalize: normalizeDream });

  const [editing, setEditing] = useState(null);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  const addVideo = (event) => {
    event.preventDefault();

    const video = parseVideo(link);
    if (!video) {
      setError("Paste a YouTube, Vimeo or .mp4 link — other pages can't be played here.");
      return;
    }

    const url = link.trim();
    setVideos([
      {
        id: createId(),
        title: title.trim() || defaultTitle(video.kind, url),
        url,
        addedAt: Date.now(),
      },
      ...videos,
    ]);

    setTitle("");
    setLink("");
    setError("");
  };

  const remove = (video) => {
    const index = videos.findIndex((item) => item.id === video.id);
    if (index === -1) return;

    setVideos(videos.filter((item) => item.id !== video.id));
    clearTimeout(undoTimer.current);
    setUndo({ video, index });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const undoRemove = () => {
    if (!undo) return;

    clearTimeout(undoTimer.current);
    const restored = [...videos];
    restored.splice(Math.min(undo.index, restored.length), 0, undo.video);
    setVideos(restored);
    setUndo(null);
  };

  const dismissUndo = () => {
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const dreamTitle = (id) => (id ? dreams.find((dream) => dream.id === id)?.title : null);

  const startEdit = (video) =>
    setEditing({ id: video.id, title: video.title, dreamId: video.dreamId ?? "" });

  const cancelEdit = () => setEditing(null);

  const setDraft = (field) => (event) =>
    setEditing((current) => (current ? { ...current, [field]: event.target.value } : current));

  // Saving a blank title would leave a nameless card, so it's treated as cancel.
  const saveEdit = () => {
    if (!editing) return;

    const title = editing.title.trim();
    if (!title) return;

    setVideos(
      videos.map((video) =>
        video.id === editing.id ? { ...video, title, dreamId: editing.dreamId || null } : video,
      ),
    );
    setEditing(null);
  };

  const onEditKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit();
    }
    if (event.key === "Escape") cancelEdit();
  };

  // The list is the order you see; moving swaps neighbours in place.
  const move = (id, step) => {
    const index = videos.findIndex((video) => video.id === id);
    const target = index + step;
    if (index === -1 || target < 0 || target >= videos.length) return;

    const next = [...videos];
    [next[index], next[target]] = [next[target], next[index]];
    setVideos(next);
  };

  return (
    <div className="container-page py-14 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Videos</h1>
      <p className="text-ink-soft mb-8">
        The talk, the tour, the performance that reminds you why it matters.
      </p>

      <form onSubmit={addVideo} className="card p-4 mb-3 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title (optional)"
          aria-label="Video title"
          className="w-full border border-line bg-base p-3 rounded-xl outline-none focus:border-violet transition-colors"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setError("");
            }}
            placeholder="https://youtube.com/watch?v=…"
            aria-label="Video link"
            className="flex-1 border border-line bg-base p-3 rounded-xl outline-none focus:border-violet transition-colors"
          />

          <button type="submit" className="btn-primary shrink-0">
            <HiOutlineVideoCamera size={18} aria-hidden="true" />
            Add video
          </button>
        </div>
      </form>

      <p className="text-xs text-ink-soft mb-8">
        YouTube and Vimeo links play right here; a direct .mp4 or .webm link plays in the browser.
      </p>

      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-clay/10 px-3 py-2 text-sm font-semibold text-bloom">
          {error}
        </p>
      )}

      {videos.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="h-12 w-12 rounded-xl bg-violet-tint flex items-center justify-center text-violet mx-auto mb-4">
            <HiOutlineFilm size={22} />
          </div>
          <h2 className="font-semibold text-lg mb-1">No videos yet</h2>
          <p className="text-ink-soft text-sm">
            Add the first one above — a dream is easier to hold onto when you can see it moving.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {videos.map((item, index) => {
              const video = parseVideo(item.url);
              const isEditing = editing?.id === item.id;

              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  {video ? (
                    <Poster video={{ ...video, url: item.url }} title={item.title} />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-base px-4 text-center text-sm text-ink-soft">
                      This link can't be played here anymore.
                    </div>
                  )}

                  <div className="px-3 py-2.5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editing.title}
                          onChange={setDraft("title")}
                          onKeyDown={onEditKeyDown}
                          aria-label={`Edit video title: ${item.title}`}
                          autoFocus
                          className="w-full border border-line bg-base px-2.5 py-1.5 rounded-lg text-sm text-ink outline-none focus:border-violet transition-colors"
                        />

                        <select
                          value={editing.dreamId}
                          onChange={setDraft("dreamId")}
                          aria-label="Dream this video belongs to"
                          className="w-full border border-line bg-base px-2.5 py-1.5 rounded-lg text-sm text-ink outline-none focus:border-violet transition-colors"
                        >
                          <option value="">No dream</option>
                          {dreams.map((dream) => (
                            <option key={dream.id} value={dream.id}>
                              {dream.title}
                            </option>
                          ))}
                          {editing.dreamId && !dreamTitle(editing.dreamId) && (
                            <option value={editing.dreamId}>Removed dream</option>
                          )}
                        </select>

                        <div className="flex items-center gap-3 text-sm">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="font-semibold text-gold-deep hover:text-clay"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-ink-soft hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate font-semibold hover:text-gold-deep transition-colors"
                          >
                            {item.title}
                          </a>
                          <p className="mt-0.5 truncate text-xs text-ink-soft">
                            {video ? sourceLabel(video.kind) : "Unknown source"}
                            {dreamTitle(item.dreamId) ? ` · ${dreamTitle(item.dreamId)}` : ""}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => move(item.id, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${item.title} earlier`}
                            className="p-2 text-ink-soft hover:text-gold-deep transition-colors disabled:opacity-30 disabled:hover:text-ink-soft"
                          >
                            <HiOutlineArrowUp size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(item.id, 1)}
                            disabled={index === videos.length - 1}
                            aria-label={`Move ${item.title} later`}
                            className="p-2 text-ink-soft hover:text-gold-deep transition-colors disabled:opacity-30 disabled:hover:text-ink-soft"
                          >
                            <HiOutlineArrowDown size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            aria-label={`Edit video: ${item.title}`}
                            className="p-2 text-ink-soft hover:text-gold-deep transition-colors"
                          >
                            <HiOutlinePencilSquare size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(item)}
                            aria-label={`Delete video: ${item.title}`}
                            className="p-2 text-ink-soft hover:text-bloom transition-colors"
                          >
                            <HiOutlineTrash size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <UndoToast
        message={undo ? `Deleted “${undo.video.title}”` : ""}
        onUndo={undo ? undoRemove : undefined}
        onDismiss={dismissUndo}
      />
    </div>
  );
};

export default Videos;
