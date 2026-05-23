import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getStreamToken, logProgressEvent } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Simple prompt bank shown during guided sessions.
const PRACTICE_PROMPTS = {
  casual: [
    "Share one good thing from your day.",
    "Ask your partner about their weekend plan.",
    "Describe your favorite food in detail.",
  ],
  interview: [
    "Tell me about yourself in 60 seconds.",
    "Describe a challenge you solved.",
    "What are your strengths and one weakness?",
  ],
  travel: [
    "Ask for directions to the nearest train station.",
    "Book a hotel room and ask for check-in details.",
    "Order food and ask for recommendations.",
  ],
  debate: [
    "Social media helps language learning.",
    "Online classes are better than offline classes.",
    "Travel is the best way to learn a language.",
  ],
};

const formatTime = (seconds) => {
  // Avoid negative values in UI timer.
  const safe = Math.max(seconds, 0);
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const CallPage = () => {
  const { id: callId } = useParams();
  const [searchParams] = useSearchParams();

  // Call config is passed from chat page through URL query params.
  const mode = searchParams.get("mode") || "casual";
  const difficulty = searchParams.get("difficulty") || "beginner";
  const duration = Number(searchParams.get("duration") || 15);

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState({ fluency: 3, confidence: 3 });

  const joinedAtRef = useRef(null);
  const didLogEndRef = useRef(false);
  const navigate = useNavigate();

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const prompts = useMemo(() => PRACTICE_PROMPTS[mode] || PRACTICE_PROMPTS.casual, [mode]);

  const endSessionMutation = useMutation({
    mutationFn: (payload) => logProgressEvent(payload),
    onSuccess: () => {
      toast.success("Session saved to your progress dashboard");
    },
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        // Build user object required by Stream video client.
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });
        joinedAtRef.current = Date.now();

        // Save event so dashboard can show session analytics later.
        logProgressEvent({
          eventType: "practice_session_started",
          language: authUser.learningLanguage || "",
          metadata: { mode, difficulty, plannedDuration: duration, callId },
        }).catch(() => {});

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId, mode, difficulty, duration]);

  useEffect(() => {
    if (!call) return;

    // Decrease timer every second while call is active.
    const timerId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          toast("Session timer completed. Wrap up and rate your session.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [call]);

  useEffect(() => {
    if (!call) return;

    // Rotate guided prompt every 90 seconds.
    const promptId = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 90000);

    return () => clearInterval(promptId);
  }, [call, prompts.length]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="card bg-base-200 border border-base-300 mb-3">
          <div className="card-body p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-primary">Mode: {mode}</span>
                <span className="badge badge-secondary">Difficulty: {difficulty}</span>
                <span className="badge badge-outline">Duration: {duration} min</span>
              </div>
              <div className="text-lg font-semibold">Time Left: {formatTime(remainingSeconds)}</div>
            </div>
            <p className="mt-2 text-sm opacity-80">
              Practice Prompt: <span className="font-medium">{prompts[promptIndex]}</span>
            </p>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden">
          {client && call ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallContent
                  onCallLeft={() => {
                    if (!didLogEndRef.current) {
                      didLogEndRef.current = true;
                      setShowRatingModal(true);
                    }
                  }}
                />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="flex items-center justify-center h-full min-h-64">
              <p>Could not initialize call. Please refresh or try again later.</p>
            </div>
          )}
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          rating={rating}
          setRating={setRating}
          onSubmit={() => {
            const joinedAt = joinedAtRef.current || Date.now();
            const durationMinutes = Math.max(1, Math.round((Date.now() - joinedAt) / 60000));

            // Save completed session stats for streak and progress cards.
            endSessionMutation.mutate({
              eventType: "practice_session_completed",
              durationMinutes,
              language: authUser?.learningLanguage || "",
              metadata: {
                mode,
                difficulty,
                plannedDuration: duration,
                rating,
                callId,
              },
            });

            setShowRatingModal(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
};

const CallContent = ({ onCallLeft }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    // When user leaves the call, parent opens rating modal.
    if (callingState === CallingState.LEFT) {
      onCallLeft();
    }
  }, [callingState, onCallLeft]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

const RatingModal = ({ rating, setRating, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h3 className="text-lg font-semibold">Rate Your Session</h3>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Fluency</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={rating.fluency}
                onChange={(e) => setRating((prev) => ({ ...prev, fluency: Number(e.target.value) }))}
                className="range range-primary"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Confidence</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={rating.confidence}
                onChange={(e) =>
                  setRating((prev) => ({ ...prev, confidence: Number(e.target.value) }))
                }
                className="range range-secondary"
              />
            </div>
          </div>

          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary" onClick={onSubmit}>
              Save Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
