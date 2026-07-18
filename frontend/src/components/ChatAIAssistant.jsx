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
  CheckIcon,
  ArrowRightIcon,
  FileTextIcon,
  SparkleIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState("translation");

  // Translation States
  const [translateInput, setTranslateInput] = useState("");
  const [translateLanguage, setTranslateLanguage] = useState(authUser?.learningLanguage || "");
  const [translateTone, setTranslateTone] = useState("natural");

  // Grammar States
  const [grammarInput, setGrammarInput] = useState("");
  const [grammarMode, setGrammarMode] = useState("natural");

  // Conversation Starter States
  const [starterLevel, setStarterLevel] = useState("beginner");
  const [starterInterests, setStarterInterests] = useState("music, travel, food");

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Copy success states
  const [copiedState, setCopiedState] = useState("");

  const triggerCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedState(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedState(""), 2000);
  };

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

  const tabs = [
    { id: "translation", label: "Translation", icon: LanguagesIcon, desc: "Convert text into different tones & languages" },
    { id: "grammar", label: "Grammar & Clarity", icon: LightbulbIcon, desc: "Identify grammar slip-ups and elevate style" },
    { id: "starters", label: "Icebreakers", icon: SparklesIcon, desc: "Generate context-aware topics based on tags" },
    { id: "voice", label: "Speech & Pronunciation", icon: MicIcon, desc: "Evaluate spoken audio and pronunciation" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
      
      {/* Sidebar Tool Navigation */}
      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all shrink-0 text-left border ${
                isSelected
                  ? "bg-primary/[0.08] text-primary border-primary/20 shadow-[inset_0_1px_0_oklch(var(--p)/0.12)]"
                  : "bg-base-200/40 border-transparent text-base-content/40 hover:text-base-content hover:bg-base-200/80"
              }`}
            >
              <TabIcon className={`size-4 ${isSelected ? "text-primary animate-pulse" : "text-base-content/30"}`} />
              <div className="hidden lg:block">
                <div>{tab.label}</div>
                <div className="text-[10px] lowercase text-base-content/30 font-normal mt-0.5 normal-case truncate max-w-[170px]">{tab.desc}</div>
              </div>
              <div className="lg:hidden">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="card bg-base-200 border border-primary/15 shadow-xl min-h-[460px] flex flex-col justify-between">
        <div className="card-body p-6 space-y-6">
          
          <AnimatePresence mode="wait">
            {activeTab === "translation" && (
              <motion.div
                key="translation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-base-content">Instant Translation & Tone</h3>
                  <p className="text-xs text-base-content/40 mt-1 leading-relaxed">
                    Translate conversational text into your target language. Adjust tone (literal, casual, or Keigo/polite) to fit the scenario.
                  </p>
                </div>

                {/* Example Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-base-content/25 font-bold">Examples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { text: "Could you look at this document?", tone: "polite" },
                      { text: "Let's grab lunch tomorrow!", tone: "casual" },
                      { text: "I really appreciate your advice.", tone: "natural" }
                    ].map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTranslateInput(ex.text);
                          setTranslateTone(ex.tone);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-base-100 border border-primary/5 text-[11px] text-base-content/50 hover:border-primary/20 hover:text-base-content/85 transition-all"
                      >
                        "{ex.text}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    className="textarea textarea-bordered w-full h-24 bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm leading-relaxed"
                    placeholder="Type text to translate…"
                    value={translateInput}
                    onChange={(e) => setTranslateInput(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Target Language</label>
                      <input
                        className="input input-bordered bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                        placeholder="e.g. Japanese, Spanish, German"
                        value={translateLanguage}
                        onChange={(e) => setTranslateLanguage(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Formality Tone</label>
                      <select
                        className="select select-bordered bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm capitalize"
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
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm gap-2 hover:shadow-glow-sm transition-all"
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending}
                >
                  {translateMutation.isPending ? (
                    <>
                      <SparkleIcon className="size-3.5 animate-spin" />
                      Translating…
                    </>
                  ) : (
                    "Translate"
                  )}
                </button>

                {/* Response Area */}
                {translateMutation.isPending && (
                  <div className="rounded-xl border border-primary/10 bg-base-100/30 p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-primary/10 rounded w-2/3" />
                    <div className="h-3 bg-primary/5 rounded w-1/2" />
                  </div>
                )}

                {translateMutation.data && !translateMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-primary/15 bg-base-100/50 p-4 space-y-3 relative overflow-hidden"
                  >
                    <div>
                      <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Translation</span>
                      <p className="text-sm font-semibold text-base-content mt-1 leading-relaxed">
                        {translateMutation.data.translatedText}
                      </p>
                    </div>
                    {translateMutation.data.notes && (
                      <div className="pt-2.5 border-t border-primary/8">
                        <span className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Notes</span>
                        <p className="text-[11.5px] text-base-content/50 mt-1 leading-relaxed leading-normal">
                          {translateMutation.data.notes}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => triggerCopy(translateMutation.data.translatedText, "trans")}
                      className="absolute top-3.5 right-3.5 btn btn-circle btn-xs btn-ghost text-base-content/40 hover:text-base-content"
                    >
                      {copiedState === "trans" ? <CheckIcon className="size-3.5 text-success" /> : <CopyIcon className="size-3.5" />}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "grammar" && (
              <motion.div
                key="grammar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-base-content">Grammar & Style Helper</h3>
                  <p className="text-xs text-base-content/40 mt-1 leading-relaxed">
                    Identify grammatical slips and explore how to frame messages with natural flair based on learning tiers.
                  </p>
                </div>

                {/* Example Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-base-content/25 font-bold">Examples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "She don't know nothing about it.",
                      "I have went to Tokyo last summer.",
                      "If I was you, I will study harder."
                    ].map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGrammarInput(ex)}
                        className="px-2.5 py-1 rounded-lg bg-base-100 border border-primary/5 text-[11px] text-base-content/50 hover:border-primary/20 hover:text-base-content/85 transition-all"
                      >
                        "{ex}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    className="textarea textarea-bordered w-full h-24 bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm leading-relaxed"
                    placeholder="Type sentence to analyze…"
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                  />

                  <div className="flex flex-col gap-1 max-w-xs">
                    <label className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Learning Tier</label>
                    <select
                      className="select select-bordered bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm capitalize"
                      value={grammarMode}
                      onChange={(e) => setGrammarMode(e.target.value)}
                    >
                      {GRAMMAR_OPTIONS.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm gap-2 hover:shadow-glow-sm transition-all"
                  onClick={handleGrammar}
                  disabled={grammarMutation.isPending}
                >
                  {grammarMutation.isPending ? (
                    <>
                      <SparkleIcon className="size-3.5 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Analyze"
                  )}
                </button>

                {/* Response Area */}
                {grammarMutation.isPending && (
                  <div className="rounded-xl border border-primary/10 bg-base-100/30 p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-primary/10 rounded w-2/3" />
                    <div className="h-3 bg-primary/5 rounded w-3/4" />
                  </div>
                )}

                {grammarMutation.data && !grammarMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-primary/15 bg-base-100/50 p-4 space-y-3 relative overflow-hidden"
                  >
                    <div>
                      <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Corrected Text</span>
                      <p className="text-sm font-semibold text-base-content mt-1 leading-relaxed">
                        {grammarMutation.data.correctedText}
                      </p>
                    </div>
                    {Array.isArray(grammarMutation.data.explanations) && grammarMutation.data.explanations.length > 0 && (
                      <div className="pt-2.5 border-t border-primary/8">
                        <span className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Suggestions & Rationale</span>
                        <ul className="space-y-1.5 mt-1.5">
                          {grammarMutation.data.explanations.map((item, idx) => (
                            <li key={idx} className="text-[11.5px] text-base-content/60 list-disc list-inside leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => triggerCopy(grammarMutation.data.correctedText, "gram")}
                      className="absolute top-3.5 right-3.5 btn btn-circle btn-xs btn-ghost text-base-content/40 hover:text-base-content"
                    >
                      {copiedState === "gram" ? <CheckIcon className="size-3.5 text-success" /> : <CopyIcon className="size-3.5" />}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "starters" && (
              <motion.div
                key="starters"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-base-content">Conversation Starters</h3>
                  <p className="text-xs text-base-content/40 mt-1 leading-relaxed">
                    Stuck on what to say? Generate custom context starters based on interests and competency level.
                  </p>
                </div>

                {/* Example Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-base-content/25 font-bold">Interests Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { level: "beginner", tags: "movies, music" },
                      { level: "intermediate", tags: "travel, outdoor sports" },
                      { level: "advanced", tags: "tech, business, design" }
                    ].map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setStarterLevel(ex.level);
                          setStarterInterests(ex.tags);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-base-100 border border-primary/5 text-[11px] text-base-content/50 hover:border-primary/20 hover:text-base-content/85 transition-all"
                      >
                        {ex.level}: {ex.tags}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Competency Level</label>
                    <input
                      className="input input-bordered bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                      placeholder="e.g. beginner, intermediate"
                      value={starterLevel}
                      onChange={(e) => setStarterLevel(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Interests (comma-separated)</label>
                    <input
                      className="input input-bordered bg-base-100/50 border-primary/10 hover:border-primary/25 focus:border-primary focus:bg-base-100 transition-all text-sm"
                      placeholder="travel, technology, food"
                      value={starterInterests}
                      onChange={(e) => setStarterInterests(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm gap-2 hover:shadow-glow-sm transition-all"
                  onClick={handleStarters}
                  disabled={starterMutation.isPending}
                >
                  {starterMutation.isPending ? (
                    <>
                      <SparkleIcon className="size-3.5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Generate Starters"
                  )}
                </button>

                {/* Response Area */}
                {starterMutation.isPending && (
                  <div className="rounded-xl border border-primary/10 bg-base-100/30 p-4 space-y-2 animate-pulse">
                    <div className="h-3.5 bg-primary/10 rounded w-5/6" />
                    <div className="h-3.5 bg-primary/5 rounded w-4/5" />
                    <div className="h-3.5 bg-primary/5 rounded w-2/3" />
                  </div>
                )}

                {starterMutation.data && !starterMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-primary/15 bg-base-100/50 p-4 space-y-2.5 relative"
                  >
                    <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Suggested Openers</span>
                    <div className="space-y-2 mt-1">
                      {Array.isArray(starterMutation.data.prompts) &&
                        starterMutation.data.prompts.map((prompt, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => triggerCopy(prompt, `starter-${idx}`)}
                            className="flex justify-between items-center bg-base-200/50 hover:bg-base-200 border border-primary/5 hover:border-primary/20 rounded-lg p-2.5 cursor-pointer transition-all duration-150 group"
                          >
                            <span className="text-xs text-base-content/75 group-hover:text-base-content leading-relaxed">{prompt}</span>
                            <span className="text-base-content/30 group-hover:text-primary transition-colors ml-3">
                              {copiedState === `starter-${idx}` ? <CheckIcon className="size-3.5 text-success" /> : <CopyIcon className="size-3.5" />}
                            </span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-base-content">Speech & Pronunciation</h3>
                  <p className="text-xs text-base-content/40 mt-1 leading-relaxed">
                    Record audio using your browser mic. AI analyzes speech metrics, outputs transcription, and flags pronunciation tweaks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-base-100/40 border border-primary/10 rounded-xl p-4">
                  {!isRecording ? (
                    <button className="btn btn-sm btn-outline gap-2 border-primary/25 hover:border-primary/50 transition-all text-xs font-semibold" onClick={startRecording}>
                      <MicIcon className="size-3.5 text-primary" />
                      Record Speech
                    </button>
                  ) : (
                    <button className="btn btn-error btn-sm gap-2 animate-pulse text-xs font-semibold" onClick={stopRecording}>
                      <SquareIcon className="size-3.5 fill-current" />
                      Stop Recording
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-1 px-3 h-8 bg-error/10 border border-error/20 rounded-lg shrink-0">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [0.6, 2.5, 0.6] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 h-3.5 bg-error rounded-full origin-center"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    className={`btn btn-sm ml-auto gap-2 text-xs font-semibold transition-all ${
                      audioBlob ? "btn-primary" : "btn-disabled opacity-50 bg-base-300/40 border-none"
                    }`}
                    onClick={handleVoiceFeedback}
                    disabled={voiceMutation.isPending || !audioBlob}
                  >
                    {voiceMutation.isPending ? (
                      <>
                        <SparkleIcon className="size-3.5 animate-spin" />
                        Analyzing Speech…
                      </>
                    ) : (
                      "Analyze Pronunciation"
                    )}
                  </button>
                </div>

                {audioBlob && (
                  <p className="text-xs text-success flex items-center gap-1 font-semibold">
                    <CheckIcon className="size-3.5" /> Recording ready for evaluation.
                  </p>
                )}

                {/* Response Area */}
                {voiceMutation.isPending && (
                  <div className="rounded-xl border border-primary/10 bg-base-100/30 p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-primary/10 rounded w-1/3" />
                    <div className="h-3.5 bg-primary/5 rounded w-5/6" />
                  </div>
                )}

                {voiceMutation.data && !voiceMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-primary/15 bg-base-100/50 p-4 space-y-3.5 relative"
                  >
                    <div>
                      <span className="text-[10px] text-primary uppercase tracking-wider font-bold">Transcription</span>
                      <p className="text-sm font-semibold text-base-content mt-1 leading-relaxed">
                        {voiceMutation.data.transcript}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button 
                          className="btn btn-xs btn-outline border-primary/15" 
                          onClick={() => triggerCopy(voiceMutation.data.transcript, "voice-transcript")}
                        >
                          {copiedState === "voice-transcript" ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                          Copy Transcript
                        </button>
                        <button 
                          className="btn btn-xs btn-primary" 
                          onClick={() => triggerCopy(voiceMutation.data.transcript, "voice-draft")}
                        >
                          {copiedState === "voice-draft" ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                          Copy for Chat
                        </button>
                      </div>
                    </div>

                    {Array.isArray(voiceMutation.data.pronunciationTips) && voiceMutation.data.pronunciationTips.length > 0 && (
                      <div className="pt-3 border-t border-primary/8">
                        <span className="text-[10px] text-base-content/30 uppercase tracking-wider font-bold">Pronunciation Adjustments</span>
                        <ul className="space-y-1.5 mt-1.5">
                          {voiceMutation.data.pronunciationTips.map((tip, idx) => (
                            <li key={idx} className="text-[11.5px] text-base-content/60 list-disc list-inside leading-relaxed">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
};

export default ChatAIAssistant;
