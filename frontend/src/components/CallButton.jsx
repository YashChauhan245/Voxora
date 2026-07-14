import { useState } from "react";
import { VideoIcon } from "lucide-react";

const PRACTICE_MODES = ["casual", "interview", "travel", "debate"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

function CallButton({ handleVideoCall }) {
  const [showModal, setShowModal] = useState(false);
  const [sessionConfig, setSessionConfig] = useState({
    mode: "casual",
    difficulty: "beginner",
    duration: 15,
  });

  const startCall = () => {
    handleVideoCall(sessionConfig);
    setShowModal(false);
  };

  return (
    <>
      <div className="p-3 border-b border-primary/15 flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0">
        <button onClick={() => setShowModal(true)} className="btn btn-success btn-sm text-white">
          <VideoIcon className="size-6" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 text-base-content w-full max-w-md shadow-xl border border-primary/20">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Start Guided Practice Session</h3>

              <div className="space-y-3">
                <div>
                  <label className="label">
                    <span className="label-text">Mode</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-base-200 text-base-content"
                    value={sessionConfig.mode}
                    onChange={(e) =>
                      setSessionConfig((prev) => ({ ...prev, mode: e.target.value }))
                    }
                  >
                    {PRACTICE_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Difficulty</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-base-200 text-base-content"
                    value={sessionConfig.difficulty}
                    onChange={(e) =>
                      setSessionConfig((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                  >
                    {DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Duration (minutes)</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    className="input input-bordered w-full bg-base-200 text-base-content"
                    value={sessionConfig.duration}
                    onChange={(e) =>
                      setSessionConfig((prev) => ({
                        ...prev,
                        duration: Number(e.target.value || 15),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={startCall}>
                  Start Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CallButton;
