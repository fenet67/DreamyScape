import { useEffect, useState } from "react";

const VisionBoard = () => {
  const [dream, setDream] = useState("");

  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem("dreamyscape-dreams");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "dreamyscape-dreams",
      JSON.stringify(dreams)
    );
  }, [dreams]);

  const addDream = () => {
    if (!dream.trim()) return;

    setDreams([
      ...dreams,
      {
        id: Date.now(),
        title: dream,
      },
    ]);

    setDream("");
  };

  const deleteDream = (id) => {
    setDreams(
      dreams.filter((dream) => dream.id !== id)
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-5xl font-bold mb-10">
        Vision Board
      </h1>

      <div className="flex gap-3 mb-10">
        <input
          type="text"
          value={dream}
          onChange={(e) =>
            setDream(e.target.value)
          }
          placeholder="Add a dream..."
          className="border p-3 rounded-lg flex-1"
        />

        <button
          onClick={addDream}
          className="border px-6 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {dreams.map((dream) => (
          <div
            key={dream.id}
            className="border rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">
              {dream.title}
            </h3>

            <button
              onClick={() =>
                deleteDream(dream.id)
              }
              className="border px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;