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
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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
    <div className="card bg-base-200/50 border border-primary/15 shadow-xl backdrop-blur-xl mb-6 hover:border-primary/20 transition-all duration-300">
      <div className="card-body p-4 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-primary/10">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <SparklesIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-base-content font-display tracking-tight text-base">AI Language Assistant</h3>
            <p className="text-xs text-base-content/40 mt-0.5">Translate, correct grammar, generate starters, or analyze pronunciation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-base-100/70 border border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/45 hover:bg-base-100/90 transition-all duration-300 shadow-sm hover:shadow-glow-sm hover:translate-y-[-1px]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-secondary/15 text-secondary">
                <LanguagesIcon className="size-4" />
              </div>
              <p className="font-semibold text-sm tracking-tight">Instant Translation + Tone</p>
            </div>

            <textarea
              className="textarea textarea-bordered w-full h-24 bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm leading-relaxed"
              placeholder="Type message to translate…"
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <input
                className="input input-bordered bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm"
                placeholder="Target language"
                value={translateLanguage}
                onChange={(e) => setTranslateLanguage(e.target.value)}
              />

              <select
                className="select select-bordered bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm"
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
              className="btn btn-primary btn-sm gap-2 hover:shadow-glow-sm active:scale-95 transition-all text-white"
              onClick={handleTranslate}
              disabled={translateMutation.isPending}
            >
              {translateMutation.isPending ? "Translating…" : "Translate"}
            </button>

            {translateMutation.data && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-base-200 rounded-lg p-3 text-sm space-y-2 overflow-hidden"
              >
                <p>
                  <span className="font-medium">Result:</span> {translateMutation.data.translatedText}
                </p>
                <p>
                  <span className="font-medium">Note:</span> {translateMutation.data.notes}
                </p>
              </motion.div>
            )}
          </section>

          <section className="bg-base-100/70 border border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/45 hover:bg-base-100/90 transition-all duration-300 shadow-sm hover:shadow-glow-sm hover:translate-y-[-1px]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-accent/15 text-accent">
                <LightbulbIcon className="size-4" />
              </div>
              <p className="font-semibold text-sm tracking-tight">Grammar + Clarity Helper</p>
            </div>

            <textarea
              className="textarea textarea-bordered w-full h-24 bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm leading-relaxed"
              placeholder="Type text for correction…"
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
            />

            <select
              className="select select-bordered w-full bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm"
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
              className="btn btn-secondary btn-sm gap-2 hover:shadow-glow-sm active:scale-95 transition-all text-white"
              onClick={handleGrammar}
              disabled={grammarMutation.isPending}
            >
              {grammarMutation.isPending ? "Improving…" : "Improve"}
            </button>

            {grammarMutation.data && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-base-200 rounded-lg p-3 text-sm space-y-2 overflow-hidden"
              >
                <p>
                  <span className="font-medium">Corrected:</span> {grammarMutation.data.correctedText}
                </p>
                {Array.isArray(grammarMutation.data.explanations) &&
                  grammarMutation.data.explanations.slice(0, 2).map((item, idx) => (
                    <p key={idx}>- {item}</p>
                  ))}
              </motion.div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-base-100/70 border border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/45 hover:bg-base-100/90 transition-all duration-300 shadow-sm hover:shadow-glow-sm hover:translate-y-[-1px]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/15 text-primary">
                <SparklesIcon className="size-4" />
              </div>
              <p className="font-semibold text-sm tracking-tight">AI Conversation Starters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <input
                className="input input-bordered bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm"
                placeholder="Level (e.g. beginner, intermediate)"
                value={starterLevel}
                onChange={(e) => setStarterLevel(e.target.value)}
              />
              <input
                className="input input-bordered bg-base-200/50 border-primary/25 hover:border-primary/50 focus:border-primary focus:bg-base-200/80 transition-all text-sm"
                placeholder="Interests (comma separated)"
                value={starterInterests}
                onChange={(e) => setStarterInterests(e.target.value)}
              />
            </div>

            <button
              className="btn btn-accent btn-sm gap-2 hover:shadow-glow-sm active:scale-95 transition-all text-white"
              onClick={handleStarters}
              disabled={starterMutation.isPending}
            >
              {starterMutation.isPending ? "Generating…" : "Generate Starters"}
            </button>

            {starterMutation.data && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-base-200 rounded-lg p-3 text-sm space-y-2 overflow-hidden"
              >
                {Array.isArray(starterMutation.data.prompts) &&
                  starterMutation.data.prompts.map((prompt, idx) => <p key={idx}>- {prompt}</p>)}
              </motion.div>
            )}
          </section>

          <section className="bg-base-100/70 border border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/45 hover:bg-base-100/90 transition-all duration-300 shadow-sm hover:shadow-glow-sm hover:translate-y-[-1px]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/15 text-primary">
                <MicIcon className="size-4" />
              </div>
              <p className="font-semibold text-sm tracking-tight">Voice-to-Text + Feedback</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!isRecording ? (
                <button className="btn btn-sm btn-outline border-primary/25 bg-base-100/50 hover:bg-base-300 hover:text-base-content hover:border-primary/25 active:scale-95 transition-all gap-2" onClick={startRecording}>
                  <MicIcon className="size-4" />
                  Start Recording
                </button>
              ) : (
                <button className="btn btn-error btn-sm gap-2 active:scale-95 transition-all" onClick={stopRecording}>
                  <SquareIcon className="size-4" />
                  Stop Recording
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-1.5 px-3 h-8 bg-error/10 border border-error/20 rounded-lg">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scaleY: [0.6, 2.8, 0.6],
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: i * 0.12,
                      }}
                      className="w-0.5 h-3 bg-error rounded-full origin-center"
                    />
                  ))}
                </div>
              )}

              <button
                className={`btn btn-sm ml-auto gap-2 active:scale-95 transition-all ${
                  audioBlob ? "btn-primary shadow-glow-sm" : "btn-disabled opacity-50 bg-base-300/40"
                }`}
                onClick={handleVoiceFeedback}
                disabled={voiceMutation.isPending || !audioBlob}
              >
                {voiceMutation.isPending ? "Analyzing…" : "Analyze Voice"}
              </button>
            </div>

            {audioBlob && <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">✨ Voice note ready for analysis.</p>}

            {voiceMutation.data && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-base-200 rounded-lg p-3 text-sm space-y-2 overflow-hidden"
              >
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
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatAIAssistant;
