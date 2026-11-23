import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import { useAuth } from "../context/auth-context";
import {
  STORAGE_KEYS,
  normalizeDream,
  normalizeGoal,
  normalizeVideo,
  useLocalStorage,
} from "../hooks/useLocalStorage";
import { collectBackup, downloadBackup, parseBackup, restoreBackup } from "../lib/backup";
import { listPhotos } from "../lib/photoStore";

const LABELS = [
  { key: "goals", label: "Goals", one: "goal", many: "goals" },
  { key: "dreams", label: "Dreams", one: "dream", many: "dreams" },
  { key: "videos", label: "Videos", one: "video", many: "videos" },
  { key: "photos", label: "Photos", one: "photo", many: "photos" },
];

const describeAdded = (added) =>
  LABELS.filter(({ key }) => added[key] > 0)
    .map(({ key, one, many }) => `${added[key]} ${added[key] === 1 ? one : many}`)
    .join(", ");

const Backup = () => {
  const { user } = useAuth();
  const owner = user?.uid ?? "guest";

  const [goals] = useLocalStorage(STORAGE_KEYS.goals, [], { normalize: normalizeGoal });
  const [dreams] = useLocalStorage(STORAGE_KEYS.dreams, [], { normalize: normalizeDream });
  const [videos] = useLocalStorage(STORAGE_KEYS.videos, [], { normalize: normalizeVideo });

  const [photoCount, setPhotoCount] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const fileInput = useRef(null);

  useEffect(() => {
    let active = true;

    listPhotos(owner)
      .then((records) => {
        if (active) setPhotoCount(records.length);
      })
      .catch(() => {
        if (active) setPhotoCount(0);
      });

    return () => {
      active = false;
    };
  }, [owner]);

  const refreshPhotoCount = () =>
    listPhotos(owner)
      .then((records) => setPhotoCount(records.length))
      .catch(() => {});

  const counts = {
    goals: goals.length,
    dreams: dreams.length,
    videos: videos.length,
    photos: photoCount,
  };

  const download = async () => {
    setStatus(null);

    try {
      const backup = await collectBackup(user?.uid);
      downloadBackup(backup);

      const total = LABELS.reduce((sum, { key }) => sum + backup[key].length, 0);
      setStatus({
        ok: true,
        text:
          total === 0
            ? "Saved an empty backup. Once you add goals, dreams or photos, download a fresh one."
            : `Backup saved with ${total} item${total === 1 ? "" : "s"} — check your downloads folder.`,
      });
    } catch (error) {
      console.warn("DreamyScape: could not build a backup", error);
      setStatus({ ok: false, text: "The backup could not be built. Try again." });
    }
  };

  const restore = async (file) => {
    if (!file) return;

    setBusy(true);
    setStatus(null);

    try {
      const incoming = parseBackup(await file.text());
      const added = await restoreBackup(user?.uid, incoming);
      const summary = describeAdded(added);

      setStatus({
        ok: true,
        text: summary
          ? `Restored ${summary}. Anything you already had was left alone.`
          : "Nothing new in that file — everything in it is already here.",
      });
      refreshPhotoCount();
    } catch (error) {
      console.warn("DreamyScape: could not restore a backup", error);
      setStatus({
        ok: false,
        text:
          error?.name === "QuotaExceededError"
            ? "This browser is out of space for photos. Goals, dreams and videos may have been restored, but the photos could not be saved."
            : (error?.message ?? "That file could not be restored."),
      });
      refreshPhotoCount();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-14 max-w-2xl">
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Backup &amp; restore</h1>
      <p className="text-ink-soft mb-10">
        Your goals, dreams, videos and photos are saved in this browser only. A backup file keeps
        them safe if the browser is cleared, and moves them to another device.
      </p>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What's saved here</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-line bg-base/60 px-3 py-2.5">
              <dt className="text-xs text-ink-soft">{label}</dt>
              <dd className="mt-0.5 text-2xl font-display font-semibold">
                {counts[key] ?? "…"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Download a backup</h2>
        <p className="text-sm text-ink-soft mb-5">
          One JSON file with everything above. Photos are included, so the file can be a few
          megabytes.
        </p>
        <button type="button" onClick={download} className="btn-primary">
          <HiOutlineArrowDownTray size={18} aria-hidden="true" />
          Download backup
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Restore from a backup</h2>
        <p className="text-sm text-ink-soft mb-5">
          Restoring only adds what isn't already here — nothing is overwritten or deleted. It goes
          into the account you're using right now.
        </p>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="btn-secondary disabled:opacity-60"
        >
          <HiOutlineArrowUpTray size={18} aria-hidden="true" />
          {busy ? "Restoring…" : "Choose a backup file"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a backup file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            restore(file);
          }}
        />
      </div>

      {status && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`mt-6 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
            status.ok ? "bg-gold-tint text-gold-deep" : "bg-clay/10 text-bloom"
          }`}
        >
          {status.ok && <HiOutlineShieldCheck size={18} aria-hidden="true" />}
          {status.text}
        </p>
      )}
    </div>
  );
};

export default Backup;
