import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, logProgressEvent } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { ArrowLeftIcon, MicIcon, MicOffIcon, SquareIcon, Trash2Icon, Volume2Icon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import ChatWorkspaceSidebar from "../components/ChatWorkspaceSidebar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const LANGUAGE_LOCALE_MAP = {
  english: "en-US",
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  mandarin: "zh-CN",
  japanese: "ja-JP",
  korean: "ko-KR",
  hindi: "hi-IN",
  russian: "ru-RU",
  portuguese: "pt-BR",
  arabic: "ar-SA",
  italian: "it-IT",
  turkish: "tr-TR",
  dutch: "nl-NL",
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);

  const chatShellRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  useEffect(() => {
    if (!authUser || !targetUserId) return;

    logProgressEvent({
      eventType: "chat_opened",
      language: authUser.learningLanguage || "",
      metadata: { targetUserId },
    }).catch(() => {});
  }, [authUser, targetUserId]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const focusChatInput = () => {
    const input = chatShellRef.current?.querySelector("textarea");
    if (!input) return;

    input.focus();
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });

        const uploadToast = toast.loading("Sending voice note...");
        try {
          // Upload audio file using Stream Chat client file uploader
          const response = await channel.sendFile(audioFile);
          
          // Send message with the audio attachment
          await channel.sendMessage({
            text: "",
            attachments: [
              {
                type: "audio",
                file_size: audioFile.size,
                mime_type: "audio/webm",
                asset_url: response.file,
                title: "Voice Note",
              },
            ],
          });
          toast.success("Voice note sent successfully", { id: uploadToast });
        } catch (err) {
          console.error("Error sending voice note:", err);
          toast.error("Failed to send voice note", { id: uploadToast });
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      audioRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      setAudioTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setAudioTimer((prev) => prev + 1);
      }, 1000);

      toast.success("Recording voice note...");
    } catch (err) {
      console.error("Error accessing mic:", err);
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
      audioRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const cancelAudioRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.onstop = () => {
        const stream = audioRecorderRef.current.stream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      audioRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    toast.success("Voice note discarded");
  };

  const formatTime = (seconds) => {
    const safe = Math.max(seconds, 0);
    const min = Math.floor(safe / 60);
    const sec = safe % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };



  const handleVideoCall = (sessionConfig) => {
    if (channel) {
      const params = new URLSearchParams({
        mode: sessionConfig?.mode || "casual",
        difficulty: sessionConfig?.difficulty || "beginner",
        duration: String(sessionConfig?.duration || 15),
      });

      const callUrl = `${window.location.origin}/call/${channel.id}?${params.toString()}`;

      channel.sendMessage({
        text: `I've started a guided video call (${sessionConfig?.mode || "casual"}, ${sessionConfig?.difficulty || "beginner"}). Join me: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  const partnerMember = Object.values(channel.state?.members || {}).find(
    (member) => member?.user?.id !== authUser._id
  );

  const partner = {
    name: partnerMember?.user?.name,
    image: partnerMember?.user?.image || authUser?.profilePic,
  };

  return (
    <div className="chat-workspace-page min-h-[calc(100vh-4rem)] overflow-y-auto p-2 sm:p-4">
      <div className="chat-workspace-grid h-full">
        <ChatWorkspaceSidebar
          partner={partner}
          onFocusInput={focusChatInput}
          onStartCall={() => handleVideoCall({ mode: "guided", difficulty: "beginner", duration: 15 })}
        />

        <section className="min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-base-200/70 px-3 py-2">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="btn btn-xs sm:btn-sm btn-outline border-primary/25 bg-base-100/40 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200 gap-1"
              >
                <ArrowLeftIcon className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <h2 className="font-semibold text-sm sm:text-base">Chat Workspace</h2>
            </div>
          </div>

          <div className="chat-panel card border border-primary/20 shadow-sm min-h-[62vh] flex-1" ref={chatShellRef}>
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <div className="w-full relative h-full">
                  <CallButton handleVideoCall={handleVideoCall} />
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <div className="chat-input-dock">
                      {isRecordingAudio ? (
                        <div className="flex items-center gap-3 bg-base-100/90 border border-primary/25 px-3 py-1.5 rounded-full w-full">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <span className="text-xs font-semibold tracking-wider font-mono">
                              {formatTime(audioTimer)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-1 justify-center">
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scaleY: [0.6, 2.4, 0.6],
                                }}
                                transition={{
                                  duration: 0.65,
                                  repeat: Infinity,
                                  delay: i * 0.08,
                                }}
                                className="w-0.5 h-3.5 bg-primary/70 rounded-full origin-center"
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              className="btn btn-xs btn-ghost text-error hover:bg-error/10 hover:text-error rounded-full p-1"
                              onClick={cancelAudioRecording}
                              title="Discard voice note"
                            >
                              <Trash2Icon className="size-4.5" />
                            </button>
                            <button
                              className="btn btn-xs btn-primary gap-1 px-2.5 rounded-full font-semibold"
                              onClick={stopAudioRecording}
                              title="Send voice note"
                            >
                              <SquareIcon className="size-3" />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-circle btn-outline border-primary/20 hover:border-primary text-primary hover:bg-primary/10"
                            onClick={startAudioRecording}
                            title="Record Voice Note"
                          >
                            <MicIcon className="size-[1.2rem] text-primary" />
                          </button>
                          <MessageInput focus />
                        </>
                      )}
                    </div>
                  </Window>
                </div>
                <Thread />
              </Channel>
            </Chat>
          </div>
        </section>
      </div>
    </div>
  );
};
export default ChatPage;