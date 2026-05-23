import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  aiConversationStarters,
  aiGrammar,
  aiTranslate,
  aiVoiceFeedback,
} from "../lib/api";
import {
  CopyIcon,
  LanguagesIcon,
  LightbulbIcon,
  MicIcon,
  SparklesIcon,
  SquareIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const TONE_OPTIONS = ["literal", "natural", "polite", "casual"];
const GRAMMAR_OPTIONS = ["beginner", "natural", "professional"];

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read audio blob"));
        return;
      }

      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const ChatAIAssistant = ({ authUser }) => {
  const [translateInput, setTranslateInput] = useState("");
  const [translateLanguage, setTranslateLanguage] = useState(authUser?.learningLanguage || "");
  const [translateTone, setTranslateTone] = useState("natural");

  const [grammarInput, setGrammarInput] = useState("");
  const [grammarMode, setGrammarMode] = useState("natural");

  const [starterLevel, setStarterLevel] = useState("beginner");
  const [starterInterests, setStarterInterests] = useState("music, travel, food");

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const translateMutation = useMutation({
    mutationFn: aiTranslate,
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Translation failed");
    },
  });

  const grammarMutation = useMutation({
    mutationFn: aiGrammar,
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Grammar suggestions failed");
    },
  });

  const starterMutation = useMutation({
    mutationFn: aiConversationStarters,
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not generate starters");
    },
  });

  const voiceMutation = useMutation({
    mutationFn: aiVoiceFeedback,
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Voice feedback failed");
    },
  });

  const recordingSupported = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.mediaDevices,
    []
  );

  const startRecording = async () => {
    if (!recordingSupported) {
      toast.error("Audio recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioMimeType(mimeType);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch {
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setIsRecording(false);
    toast.success("Recording captured");
  };

  const handleTranslate = () => {
    if (!translateInput.trim() || !translateLanguage.trim()) {
      toast.error("Enter text and target language");
      return;
    }

    translateMutation.mutate({
      text: translateInput,
      targetLanguage: translateLanguage,
      tone: translateTone,
    });
  };

  const handleGrammar = () => {
    if (!grammarInput.trim()) {
      toast.error("Enter a message for grammar help");
      return;
    }

    grammarMutation.mutate({
      text: grammarInput,
      mode: grammarMode,
    });
  };

  const handleStarters = () => {
    starterMutation.mutate({
      nativeLanguage: authUser?.nativeLanguage || "english",
      learningLanguage: authUser?.learningLanguage || "spanish",
      level: starterLevel,
      interests: starterInterests
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      count: 5,
    });
  };

  const handleVoiceFeedback = async () => {
    if (!audioBlob) {
      toast.error("Record audio first");
      return;
    }

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      voiceMutation.mutate({
        audioBase64,
        mimeType: audioMimeType,
        targetLanguage: authUser?.learningLanguage || "english",
        translateTo: authUser?.nativeLanguage || "",
      });
    } catch {
      toast.error("Could not process audio file");
    }
  };

  const handleCopyTranscript = async () => {
    const transcript = voiceMutation.data?.transcript;
    if (!transcript) {
      toast.error("No transcript available yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript);
      toast.success("Transcript copied");
    } catch {
      toast.error("Could not copy transcript");
    }
  };

  const handleUseAsDraft = async () => {
    const transcript = voiceMutation.data?.transcript;
    if (!transcript) {
      toast.error("No transcript available yet");
      return;
    }

    // Keeping it simple: copy transcript so user can paste into Stream input.
    try {
      await navigator.clipboard.writeText(transcript);
      toast.success("Transcript copied. Paste it in chat input.");
    } catch {
      toast.error("Could not copy transcript");
    }
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm mb-4">
      <div className="card-body p-4 space-y-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-5 text-primary" />
          <h3 className="font-semibold">AI Language Assistant</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-base-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="size-4 text-secondary" />
              <p className="font-medium">Instant Translation + Tone</p>
            </div>

            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder="Type message to translate"
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                className="input input-bordered"
                placeholder="Target language"
                value={translateLanguage}
                onChange={(e) => setTranslateLanguage(e.target.value)}
              />

              <select
                className="select select-bordered"
                value={translateTone}
                onChange={(e) => setTranslateTone(e.target.value)}
              >
                {TONE_OPTIONS.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleTranslate}
              disabled={translateMutation.isPending}
            >
              {translateMutation.isPending ? "Translating..." : "Translate"}
            </button>

            {translateMutation.data && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-2">
                <p>
                  <span className="font-medium">Result:</span> {translateMutation.data.translatedText}
                </p>
                <p>
                  <span className="font-medium">Note:</span> {translateMutation.data.notes}
                </p>
              </div>
            )}
          </section>

          <section className="bg-base-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="size-4 text-accent" />
              <p className="font-medium">Grammar + Clarity Helper</p>
            </div>

            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder="Type text for correction"
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
            />

            <select
              className="select select-bordered w-full"
              value={grammarMode}
              onChange={(e) => setGrammarMode(e.target.value)}
            >
              {GRAMMAR_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleGrammar}
              disabled={grammarMutation.isPending}
            >
              {grammarMutation.isPending ? "Improving..." : "Improve"}
            </button>

            {grammarMutation.data && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-2">
                <p>
                  <span className="font-medium">Corrected:</span> {grammarMutation.data.correctedText}
                </p>
                {Array.isArray(grammarMutation.data.explanations) &&
                  grammarMutation.data.explanations.slice(0, 2).map((item, idx) => (
                    <p key={idx}>- {item}</p>
                  ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-base-100 rounded-xl p-4 space-y-3">
            <p className="font-medium">AI Conversation Starters</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                className="input input-bordered"
                placeholder="Level"
                value={starterLevel}
                onChange={(e) => setStarterLevel(e.target.value)}
              />
              <input
                className="input input-bordered"
                placeholder="Interests (comma separated)"
                value={starterInterests}
                onChange={(e) => setStarterInterests(e.target.value)}
              />
            </div>

            <button
              className="btn btn-accent btn-sm"
              onClick={handleStarters}
              disabled={starterMutation.isPending}
            >
              {starterMutation.isPending ? "Generating..." : "Generate Starters"}
            </button>

            {starterMutation.data && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-2">
                {Array.isArray(starterMutation.data.prompts) &&
                  starterMutation.data.prompts.map((prompt, idx) => <p key={idx}>- {prompt}</p>)}
              </div>
            )}
          </section>

          <section className="bg-base-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MicIcon className="size-4 text-primary" />
              <p className="font-medium">Voice-to-Text + Feedback</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isRecording ? (
                <button className="btn btn-outline btn-sm" onClick={startRecording}>
                  <MicIcon className="size-4" />
                  Start Recording
                </button>
              ) : (
                <button className="btn btn-error btn-sm" onClick={stopRecording}>
                  <SquareIcon className="size-4" />
                  Stop Recording
                </button>
              )}

              <button
                className="btn btn-primary btn-sm"
                onClick={handleVoiceFeedback}
                disabled={voiceMutation.isPending || !audioBlob}
              >
                {voiceMutation.isPending ? "Analyzing..." : "Analyze Voice"}
              </button>
            </div>

            {audioBlob && <p className="text-xs opacity-70">Voice note ready for analysis.</p>}

            {voiceMutation.data && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-2">
                <p>
                  <span className="font-medium">Transcript:</span> {voiceMutation.data.transcript}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-xs btn-outline" onClick={handleCopyTranscript}>
                    <CopyIcon className="size-3" />
                    Copy Text
                  </button>
                  <button className="btn btn-xs btn-primary" onClick={handleUseAsDraft}>
                    <CopyIcon className="size-3" />
                    Copy for Chat
                  </button>
                </div>
                {Array.isArray(voiceMutation.data.pronunciationTips) &&
                  voiceMutation.data.pronunciationTips.slice(0, 2).map((tip, idx) => (
                    <p key={idx}>- {tip}</p>
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatAIAssistant;
