import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
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
import { MicIcon, MicOffIcon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import ChatWorkspaceSidebar from "../components/ChatWorkspaceSidebar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const chatShellRef = useRef(null);

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
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, [recognitionRef]);

  const focusChatInput = () => {
    const input = chatShellRef.current?.querySelector("textarea");
    if (!input) return;

    input.focus();
  };

  const updateChatDraft = (incomingText, append = true) => {
    const input = chatShellRef.current?.querySelector("textarea");
    if (!input || !incomingText) return;

    const cleanText = incomingText.trim();
    if (!cleanText) return;

    const nextValue = append && input.value ? `${input.value} ${cleanText}` : cleanText;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    nativeSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopVoiceTyping = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const startVoiceTyping = () => {
    if (!speechSupported) {
      toast.error("Voice typing is not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        updateChatDraft(finalTranscript, true);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Could not capture voice. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
    toast.success("Voice typing started");
  };

  const toggleVoiceTyping = () => {
    if (isListening) {
      stopVoiceTyping();
      return;
    }
    startVoiceTyping();
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
          onToggleVoice={toggleVoiceTyping}
          isListening={isListening}
          voiceSupported={speechSupported}
          onStartCall={() => handleVideoCall({ mode: "guided", difficulty: "beginner", duration: 15 })}
        />

        <section className="min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200/70 px-3 py-2">
            <h2 className="font-semibold text-lg">Chat Workspace</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`btn btn-sm btn-circle ${isListening ? "btn-error" : "btn-outline"}`}
                onClick={toggleVoiceTyping}
                disabled={!speechSupported}
                title={
                  !speechSupported
                    ? "Speech recognition is not supported in this browser"
                    : isListening
                      ? "Stop voice typing"
                      : "Start voice typing"
                }
              >
                {isListening ? <MicOffIcon className="size-[1.2rem]" /> : <MicIcon className="size-[1.2rem]" />}
              </button>
            </div>
          </div>

          <div className="chat-panel card border border-base-300 shadow-sm min-h-[62vh] flex-1" ref={chatShellRef}>
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <div className="w-full relative h-full">
                  <CallButton handleVideoCall={handleVideoCall} />
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <div className="chat-input-dock">
                      <button
                        className={`btn btn-sm btn-circle ${isListening ? "btn-error" : "btn-ghost"}`}
                        onClick={toggleVoiceTyping}
                        disabled={!speechSupported}
                        title={isListening ? "Stop voice typing" : "Start voice typing"}
                      >
                        {isListening ? <MicOffIcon className="size-[1.2rem]" /> : <MicIcon className="size-[1.2rem]" />}
                      </button>
                      <MessageInput focus />
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