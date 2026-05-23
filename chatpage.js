import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/ChatPage.jsx");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_STREAM_API_KEY": "gu7j2aug33tr"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=cc136696"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=cc136696"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useRef = __vite__cjsImport3_react["useRef"]; const useState = __vite__cjsImport3_react["useState"];
import { useParams } from "/node_modules/.vite/deps/react-router.js?v=cc136696";
import useAuthUser from "/src/hooks/useAuthUser.js";
import { useQuery } from "/node_modules/.vite/deps/@tanstack_react-query.js?v=cc136696";
import { getStreamToken, logProgressEvent } from "/src/lib/api.js";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window
} from "/node_modules/.vite/deps/stream-chat-react.js?v=cc136696";
import { StreamChat } from "/node_modules/.vite/deps/stream-chat.js?v=cc136696";
import toast from "/node_modules/.vite/deps/react-hot-toast.js?v=cc136696";
import { MicIcon, MicOffIcon } from "/node_modules/.vite/deps/lucide-react.js?v=cc136696";
import ChatLoader from "/src/components/ChatLoader.jsx";
import CallButton from "/src/components/CallButton.jsx";
import ChatWorkspaceSidebar from "/src/components/ChatWorkspaceSidebar.jsx";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const ChatPage = () => {
  _s();
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
    enabled: !!authUser
    // this will run only when authUser is available
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
            image: authUser.profilePic
          },
          tokenData.token
        );
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId]
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
      metadata: { targetUserId }
    }).catch(() => {
    });
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
  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
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
        duration: String(sessionConfig?.duration || 15)
      });
      const callUrl = `${window.location.origin}/call/${channel.id}?${params.toString()}`;
      channel.sendMessage({
        text: `I've started a guided video call (${sessionConfig?.mode || "casual"}, ${sessionConfig?.difficulty || "beginner"}). Join me: ${callUrl}`
      });
      toast.success("Video call link sent successfully!");
    }
  };
  if (loading || !chatClient || !channel) return /* @__PURE__ */ jsxDEV(ChatLoader, {}, void 0, false, {
    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
    lineNumber: 232,
    columnNumber: 50
  }, this);
  const partnerMember = Object.values(channel.state?.members || {}).find(
    (member) => member?.user?.id !== authUser._id
  );
  const partner = {
    name: partnerMember?.user?.name,
    image: partnerMember?.user?.image || authUser?.profilePic
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "chat-workspace-page min-h-[calc(100vh-4rem)] overflow-y-auto p-2 sm:p-4", children: /* @__PURE__ */ jsxDEV("div", { className: "chat-workspace-grid h-full", children: [
    /* @__PURE__ */ jsxDEV(
      ChatWorkspaceSidebar,
      {
        partner,
        onFocusInput: focusChatInput,
        onToggleVoice: toggleVoiceTyping,
        isListening,
        voiceSupported: speechSupported,
        onStartCall: () => handleVideoCall({ mode: "guided", difficulty: "beginner", duration: 15 })
      },
      void 0,
      false,
      {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
        lineNumber: 246,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "min-w-0 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200/70 px-3 py-2", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "font-semibold text-lg", children: "Chat Workspace" }, void 0, false, {
          fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
          lineNumber: 257,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: `btn btn-sm btn-circle ${isListening ? "btn-error" : "btn-outline"}`,
            onClick: toggleVoiceTyping,
            disabled: !speechSupported,
            title: !speechSupported ? "Speech recognition is not supported in this browser" : isListening ? "Stop voice typing" : "Start voice typing",
            children: isListening ? /* @__PURE__ */ jsxDEV(MicOffIcon, { className: "size-[1.2rem]" }, void 0, false, {
              fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
              lineNumber: 271,
              columnNumber: 32
            }, this) : /* @__PURE__ */ jsxDEV(MicIcon, { className: "size-[1.2rem]" }, void 0, false, {
              fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
              lineNumber: 271,
              columnNumber: 75
            }, this)
          },
          void 0,
          false,
          {
            fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
            lineNumber: 259,
            columnNumber: 15
          },
          this
        ) }, void 0, false, {
          fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
          lineNumber: 258,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
        lineNumber: 256,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "chat-panel card border border-base-300 shadow-sm min-h-[62vh] flex-1", ref: chatShellRef, children: /* @__PURE__ */ jsxDEV(Chat, { client: chatClient, children: /* @__PURE__ */ jsxDEV(Channel, { channel, children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-full relative h-full", children: [
          /* @__PURE__ */ jsxDEV(CallButton, { handleVideoCall }, void 0, false, {
            fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
            lineNumber: 280,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(Window, { children: [
            /* @__PURE__ */ jsxDEV(ChannelHeader, {}, void 0, false, {
              fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
              lineNumber: 282,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV(MessageList, {}, void 0, false, {
              fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
              lineNumber: 283,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "chat-input-dock", children: [
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `btn btn-sm btn-circle ${isListening ? "btn-error" : "btn-ghost"}`,
                  onClick: toggleVoiceTyping,
                  disabled: !speechSupported,
                  title: isListening ? "Stop voice typing" : "Start voice typing",
                  children: isListening ? /* @__PURE__ */ jsxDEV(MicOffIcon, { className: "size-[1.2rem]" }, void 0, false, {
                    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
                    lineNumber: 291,
                    columnNumber: 40
                  }, this) : /* @__PURE__ */ jsxDEV(MicIcon, { className: "size-[1.2rem]" }, void 0, false, {
                    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
                    lineNumber: 291,
                    columnNumber: 83
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
                  lineNumber: 285,
                  columnNumber: 23
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(MessageInput, { focus: true }, void 0, false, {
                fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
                lineNumber: 293,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
              lineNumber: 284,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
            lineNumber: 281,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
          lineNumber: 279,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Thread, {}, void 0, false, {
          fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
          lineNumber: 297,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
        lineNumber: 278,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
        lineNumber: 277,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
        lineNumber: 276,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
      lineNumber: 255,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
    lineNumber: 245,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx",
    lineNumber: 244,
    columnNumber: 5
  }, this);
};
_s(ChatPage, "dcklTALjxr36OtwbWrHn2GSas2Q=", false, function() {
  return [useParams, useAuthUser, useQuery];
});
_c = ChatPage;
export default ChatPage;
var _c;
$RefreshReg$(_c, "ChatPage");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/Yash/Desktop/Voxora/frontend/src/pages/ChatPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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VCxHQXBRSUQsVUFBUTtBQUFBLFVBQ2lCdkIsV0FVUkMsYUFFT0MsUUFBUTtBQUFBO0FBQUEsS0FiaENxQjtBQXFRTixlQUFlQTtBQUFTLElBQUFnSDtBQUFBLGFBQUFBLElBQUEiLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsInVzZVBhcmFtcyIsInVzZUF1dGhVc2VyIiwidXNlUXVlcnkiLCJnZXRTdHJlYW1Ub2tlbiIsImxvZ1Byb2dyZXNzRXZlbnQiLCJDaGFubmVsIiwiQ2hhbm5lbEhlYWRlciIsIkNoYXQiLCJNZXNzYWdlSW5wdXQiLCJNZXNzYWdlTGlzdCIsIlRocmVhZCIsIldpbmRvdyIsIlN0cmVhbUNoYXQiLCJ0b2FzdCIsIk1pY0ljb24iLCJNaWNPZmZJY29uIiwiQ2hhdExvYWRlciIsIkNhbGxCdXR0b24iLCJDaGF0V29ya3NwYWNlU2lkZWJhciIsIlNUUkVBTV9BUElfS0VZIiwiaW1wb3J0IiwiZW52IiwiVklURV9TVFJFQU1fQVBJX0tFWSIsIkNoYXRQYWdlIiwiX3MiLCJpZCIsInRhcmdldFVzZXJJZCIsImNoYXRDbGllbnQiLCJzZXRDaGF0Q2xpZW50IiwiY2hhbm5lbCIsInNldENoYW5uZWwiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsImlzTGlzdGVuaW5nIiwic2V0SXNMaXN0ZW5pbmciLCJyZWNvZ25pdGlvblJlZiIsImNoYXRTaGVsbFJlZiIsImF1dGhVc2VyIiwiZGF0YSIsInRva2VuRGF0YSIsInF1ZXJ5S2V5IiwicXVlcnlGbiIsImVuYWJsZWQiLCJpbml0Q2hhdCIsInRva2VuIiwiY29uc29sZSIsImxvZyIsImNsaWVudCIsImdldEluc3RhbmNlIiwiY29ubmVjdFVzZXIiLCJfaWQiLCJuYW1lIiwiZnVsbE5hbWUiLCJpbWFnZSIsInByb2ZpbGVQaWMiLCJjaGFubmVsSWQiLCJzb3J0Iiwiam9pbiIsImN1cnJDaGFubmVsIiwibWVtYmVycyIsIndhdGNoIiwiZXJyb3IiLCJldmVudFR5cGUiLCJsYW5ndWFnZSIsImxlYXJuaW5nTGFuZ3VhZ2UiLCJtZXRhZGF0YSIsImNhdGNoIiwiY3VycmVudCIsIm9ucmVzdWx0Iiwib25lbmQiLCJvbmVycm9yIiwic3RvcCIsImZvY3VzQ2hhdElucHV0IiwiaW5wdXQiLCJxdWVyeVNlbGVjdG9yIiwiZm9jdXMiLCJ1cGRhdGVDaGF0RHJhZnQiLCJpbmNvbWluZ1RleHQiLCJhcHBlbmQiLCJjbGVhblRleHQiLCJ0cmltIiwibmV4dFZhbHVlIiwidmFsdWUiLCJuYXRpdmVTZXR0ZXIiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJ3aW5kb3ciLCJIVE1MVGV4dEFyZWFFbGVtZW50IiwicHJvdG90eXBlIiwic2V0IiwiY2FsbCIsImRpc3BhdGNoRXZlbnQiLCJFdmVudCIsImJ1YmJsZXMiLCJzcGVlY2hTdXBwb3J0ZWQiLCJzdG9wVm9pY2VUeXBpbmciLCJzdGFydFZvaWNlVHlwaW5nIiwiU3BlZWNoUmVjb2duaXRpb24iLCJ3ZWJraXRTcGVlY2hSZWNvZ25pdGlvbiIsInJlY29nbml0aW9uIiwibGFuZyIsImludGVyaW1SZXN1bHRzIiwiY29udGludW91cyIsImV2ZW50IiwiZmluYWxUcmFuc2NyaXB0IiwiaSIsInJlc3VsdEluZGV4IiwicmVzdWx0cyIsImxlbmd0aCIsImlzRmluYWwiLCJ0cmFuc2NyaXB0Iiwic3RhcnQiLCJzdWNjZXNzIiwidG9nZ2xlVm9pY2VUeXBpbmciLCJoYW5kbGVWaWRlb0NhbGwiLCJzZXNzaW9uQ29uZmlnIiwicGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwibW9kZSIsImRpZmZpY3VsdHkiLCJkdXJhdGlvbiIsIlN0cmluZyIsImNhbGxVcmwiLCJsb2NhdGlvbiIsIm9yaWdpbiIsInRvU3RyaW5nIiwic2VuZE1lc3NhZ2UiLCJ0ZXh0IiwicGFydG5lck1lbWJlciIsInZhbHVlcyIsInN0YXRlIiwiZmluZCIsIm1lbWJlciIsInVzZXIiLCJwYXJ0bmVyIiwiX2MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQ2hhdFBhZ2UuanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyB1c2VQYXJhbXMgfSBmcm9tIFwicmVhY3Qtcm91dGVyXCI7XHJcbmltcG9ydCB1c2VBdXRoVXNlciBmcm9tIFwiLi4vaG9va3MvdXNlQXV0aFVzZXJcIjtcclxuaW1wb3J0IHsgdXNlUXVlcnkgfSBmcm9tIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCI7XHJcbmltcG9ydCB7IGdldFN0cmVhbVRva2VuLCBsb2dQcm9ncmVzc0V2ZW50IH0gZnJvbSBcIi4uL2xpYi9hcGlcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgQ2hhbm5lbCxcclxuICBDaGFubmVsSGVhZGVyLFxyXG4gIENoYXQsXHJcbiAgTWVzc2FnZUlucHV0LFxyXG4gIE1lc3NhZ2VMaXN0LFxyXG4gIFRocmVhZCxcclxuICBXaW5kb3csXHJcbn0gZnJvbSBcInN0cmVhbS1jaGF0LXJlYWN0XCI7XHJcbmltcG9ydCB7IFN0cmVhbUNoYXQgfSBmcm9tIFwic3RyZWFtLWNoYXRcIjtcclxuaW1wb3J0IHRvYXN0IGZyb20gXCJyZWFjdC1ob3QtdG9hc3RcIjtcclxuaW1wb3J0IHsgTWljSWNvbiwgTWljT2ZmSWNvbiB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcclxuXHJcbmltcG9ydCBDaGF0TG9hZGVyIGZyb20gXCIuLi9jb21wb25lbnRzL0NoYXRMb2FkZXJcIjtcclxuaW1wb3J0IENhbGxCdXR0b24gZnJvbSBcIi4uL2NvbXBvbmVudHMvQ2FsbEJ1dHRvblwiO1xyXG5pbXBvcnQgQ2hhdFdvcmtzcGFjZVNpZGViYXIgZnJvbSBcIi4uL2NvbXBvbmVudHMvQ2hhdFdvcmtzcGFjZVNpZGViYXJcIjtcclxuXHJcbmNvbnN0IFNUUkVBTV9BUElfS0VZID0gaW1wb3J0Lm1ldGEuZW52LlZJVEVfU1RSRUFNX0FQSV9LRVk7XHJcblxyXG5jb25zdCBDaGF0UGFnZSA9ICgpID0+IHtcclxuICBjb25zdCB7IGlkOiB0YXJnZXRVc2VySWQgfSA9IHVzZVBhcmFtcygpO1xyXG5cclxuICBjb25zdCBbY2hhdENsaWVudCwgc2V0Q2hhdENsaWVudF0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbY2hhbm5lbCwgc2V0Q2hhbm5lbF0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbaXNMaXN0ZW5pbmcsIHNldElzTGlzdGVuaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuXHJcbiAgY29uc3QgcmVjb2duaXRpb25SZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgY2hhdFNoZWxsUmVmID0gdXNlUmVmKG51bGwpO1xyXG5cclxuICBjb25zdCB7IGF1dGhVc2VyIH0gPSB1c2VBdXRoVXNlcigpO1xyXG5cclxuICBjb25zdCB7IGRhdGE6IHRva2VuRGF0YSB9ID0gdXNlUXVlcnkoe1xyXG4gICAgcXVlcnlLZXk6IFtcInN0cmVhbVRva2VuXCJdLFxyXG4gICAgcXVlcnlGbjogZ2V0U3RyZWFtVG9rZW4sXHJcbiAgICBlbmFibGVkOiAhIWF1dGhVc2VyLCAvLyB0aGlzIHdpbGwgcnVuIG9ubHkgd2hlbiBhdXRoVXNlciBpcyBhdmFpbGFibGVcclxuICB9KTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGluaXRDaGF0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoIXRva2VuRGF0YT8udG9rZW4gfHwgIWF1dGhVc2VyKSByZXR1cm47XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIHN0cmVhbSBjaGF0IGNsaWVudC4uLlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgY2xpZW50ID0gU3RyZWFtQ2hhdC5nZXRJbnN0YW5jZShTVFJFQU1fQVBJX0tFWSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGNsaWVudC5jb25uZWN0VXNlcihcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IGF1dGhVc2VyLl9pZCxcclxuICAgICAgICAgICAgbmFtZTogYXV0aFVzZXIuZnVsbE5hbWUsXHJcbiAgICAgICAgICAgIGltYWdlOiBhdXRoVXNlci5wcm9maWxlUGljLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRva2VuRGF0YS50b2tlblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgY29uc3QgY2hhbm5lbElkID0gW2F1dGhVc2VyLl9pZCwgdGFyZ2V0VXNlcklkXS5zb3J0KCkuam9pbihcIi1cIik7XHJcblxyXG4gICAgICAgIC8vIHlvdSBhbmQgbWVcclxuICAgICAgICAvLyBpZiBpIHN0YXJ0IHRoZSBjaGF0ID0+IGNoYW5uZWxJZDogW215SWQsIHlvdXJJZF1cclxuICAgICAgICAvLyBpZiB5b3Ugc3RhcnQgdGhlIGNoYXQgPT4gY2hhbm5lbElkOiBbeW91cklkLCBteUlkXSAgPT4gW215SWQseW91cklkXVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyQ2hhbm5lbCA9IGNsaWVudC5jaGFubmVsKFwibWVzc2FnaW5nXCIsIGNoYW5uZWxJZCwge1xyXG4gICAgICAgICAgbWVtYmVyczogW2F1dGhVc2VyLl9pZCwgdGFyZ2V0VXNlcklkXSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXdhaXQgY3VyckNoYW5uZWwud2F0Y2goKTtcclxuXHJcbiAgICAgICAgc2V0Q2hhdENsaWVudChjbGllbnQpO1xyXG4gICAgICAgIHNldENoYW5uZWwoY3VyckNoYW5uZWwpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBpbml0aWFsaXppbmcgY2hhdDpcIiwgZXJyb3IpO1xyXG4gICAgICAgIHRvYXN0LmVycm9yKFwiQ291bGQgbm90IGNvbm5lY3QgdG8gY2hhdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaW5pdENoYXQoKTtcclxuICB9LCBbdG9rZW5EYXRhLCBhdXRoVXNlciwgdGFyZ2V0VXNlcklkXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIWF1dGhVc2VyIHx8ICF0YXJnZXRVc2VySWQpIHJldHVybjtcclxuXHJcbiAgICBsb2dQcm9ncmVzc0V2ZW50KHtcclxuICAgICAgZXZlbnRUeXBlOiBcImNoYXRfb3BlbmVkXCIsXHJcbiAgICAgIGxhbmd1YWdlOiBhdXRoVXNlci5sZWFybmluZ0xhbmd1YWdlIHx8IFwiXCIsXHJcbiAgICAgIG1ldGFkYXRhOiB7IHRhcmdldFVzZXJJZCB9LFxyXG4gICAgfSkuY2F0Y2goKCkgPT4ge30pO1xyXG4gIH0sIFthdXRoVXNlciwgdGFyZ2V0VXNlcklkXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBpZiAocmVjb2duaXRpb25SZWYuY3VycmVudCkge1xyXG4gICAgICAgIHJlY29nbml0aW9uUmVmLmN1cnJlbnQub25yZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIHJlY29nbml0aW9uUmVmLmN1cnJlbnQub25lbmQgPSBudWxsO1xyXG4gICAgICAgIHJlY29nbml0aW9uUmVmLmN1cnJlbnQub25lcnJvciA9IG51bGw7XHJcbiAgICAgICAgcmVjb2duaXRpb25SZWYuY3VycmVudC5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSwgW3JlY29nbml0aW9uUmVmXSk7XHJcblxyXG4gIGNvbnN0IGZvY3VzQ2hhdElucHV0ID0gKCkgPT4ge1xyXG4gICAgY29uc3QgaW5wdXQgPSBjaGF0U2hlbGxSZWYuY3VycmVudD8ucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpO1xyXG4gICAgaWYgKCFpbnB1dCkgcmV0dXJuO1xyXG5cclxuICAgIGlucHV0LmZvY3VzKCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdXBkYXRlQ2hhdERyYWZ0ID0gKGluY29taW5nVGV4dCwgYXBwZW5kID0gdHJ1ZSkgPT4ge1xyXG4gICAgY29uc3QgaW5wdXQgPSBjaGF0U2hlbGxSZWYuY3VycmVudD8ucXVlcnlTZWxlY3RvcihcInRleHRhcmVhXCIpO1xyXG4gICAgaWYgKCFpbnB1dCB8fCAhaW5jb21pbmdUZXh0KSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY2xlYW5UZXh0ID0gaW5jb21pbmdUZXh0LnRyaW0oKTtcclxuICAgIGlmICghY2xlYW5UZXh0KSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgbmV4dFZhbHVlID0gYXBwZW5kICYmIGlucHV0LnZhbHVlID8gYCR7aW5wdXQudmFsdWV9ICR7Y2xlYW5UZXh0fWAgOiBjbGVhblRleHQ7XHJcbiAgICBjb25zdCBuYXRpdmVTZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFxyXG4gICAgICB3aW5kb3cuSFRNTFRleHRBcmVhRWxlbWVudC5wcm90b3R5cGUsXHJcbiAgICAgIFwidmFsdWVcIlxyXG4gICAgKT8uc2V0O1xyXG5cclxuICAgIG5hdGl2ZVNldHRlcj8uY2FsbChpbnB1dCwgbmV4dFZhbHVlKTtcclxuICAgIGlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcclxuICAgIGlucHV0LmZvY3VzKCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc3BlZWNoU3VwcG9ydGVkID1cclxuICAgIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiZcclxuICAgIChcIlNwZWVjaFJlY29nbml0aW9uXCIgaW4gd2luZG93IHx8IFwid2Via2l0U3BlZWNoUmVjb2duaXRpb25cIiBpbiB3aW5kb3cpO1xyXG5cclxuICBjb25zdCBzdG9wVm9pY2VUeXBpbmcgPSAoKSA9PiB7XHJcbiAgICBpZiAoIXJlY29nbml0aW9uUmVmLmN1cnJlbnQpIHJldHVybjtcclxuICAgIHJlY29nbml0aW9uUmVmLmN1cnJlbnQuc3RvcCgpO1xyXG4gICAgc2V0SXNMaXN0ZW5pbmcoZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHN0YXJ0Vm9pY2VUeXBpbmcgPSAoKSA9PiB7XHJcbiAgICBpZiAoIXNwZWVjaFN1cHBvcnRlZCkge1xyXG4gICAgICB0b2FzdC5lcnJvcihcIlZvaWNlIHR5cGluZyBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFNwZWVjaFJlY29nbml0aW9uID0gd2luZG93LlNwZWVjaFJlY29nbml0aW9uIHx8IHdpbmRvdy53ZWJraXRTcGVlY2hSZWNvZ25pdGlvbjtcclxuICAgIGNvbnN0IHJlY29nbml0aW9uID0gbmV3IFNwZWVjaFJlY29nbml0aW9uKCk7XHJcbiAgICByZWNvZ25pdGlvblJlZi5jdXJyZW50ID0gcmVjb2duaXRpb247XHJcblxyXG4gICAgcmVjb2duaXRpb24ubGFuZyA9IFwiZW4tVVNcIjtcclxuICAgIHJlY29nbml0aW9uLmludGVyaW1SZXN1bHRzID0gdHJ1ZTtcclxuICAgIHJlY29nbml0aW9uLmNvbnRpbnVvdXMgPSB0cnVlO1xyXG5cclxuICAgIHJlY29nbml0aW9uLm9ucmVzdWx0ID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgIGxldCBmaW5hbFRyYW5zY3JpcHQgPSBcIlwiO1xyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IGV2ZW50LnJlc3VsdEluZGV4OyBpIDwgZXZlbnQucmVzdWx0cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmIChldmVudC5yZXN1bHRzW2ldLmlzRmluYWwpIHtcclxuICAgICAgICAgIGZpbmFsVHJhbnNjcmlwdCArPSBldmVudC5yZXN1bHRzW2ldWzBdLnRyYW5zY3JpcHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZmluYWxUcmFuc2NyaXB0LnRyaW0oKSkge1xyXG4gICAgICAgIHVwZGF0ZUNoYXREcmFmdChmaW5hbFRyYW5zY3JpcHQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJlY29nbml0aW9uLm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgIHNldElzTGlzdGVuaW5nKGZhbHNlKTtcclxuICAgICAgdG9hc3QuZXJyb3IoXCJDb3VsZCBub3QgY2FwdHVyZSB2b2ljZS4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICB9O1xyXG5cclxuICAgIHJlY29nbml0aW9uLm9uZW5kID0gKCkgPT4ge1xyXG4gICAgICBzZXRJc0xpc3RlbmluZyhmYWxzZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJlY29nbml0aW9uLnN0YXJ0KCk7XHJcbiAgICBzZXRJc0xpc3RlbmluZyh0cnVlKTtcclxuICAgIHRvYXN0LnN1Y2Nlc3MoXCJWb2ljZSB0eXBpbmcgc3RhcnRlZFwiKTtcclxuICB9O1xyXG5cclxuICBjb25zdCB0b2dnbGVWb2ljZVR5cGluZyA9ICgpID0+IHtcclxuICAgIGlmIChpc0xpc3RlbmluZykge1xyXG4gICAgICBzdG9wVm9pY2VUeXBpbmcoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc3RhcnRWb2ljZVR5cGluZygpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZVZpZGVvQ2FsbCA9IChzZXNzaW9uQ29uZmlnKSA9PiB7XHJcbiAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcclxuICAgICAgICBtb2RlOiBzZXNzaW9uQ29uZmlnPy5tb2RlIHx8IFwiY2FzdWFsXCIsXHJcbiAgICAgICAgZGlmZmljdWx0eTogc2Vzc2lvbkNvbmZpZz8uZGlmZmljdWx0eSB8fCBcImJlZ2lubmVyXCIsXHJcbiAgICAgICAgZHVyYXRpb246IFN0cmluZyhzZXNzaW9uQ29uZmlnPy5kdXJhdGlvbiB8fCAxNSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgY2FsbFVybCA9IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L2NhbGwvJHtjaGFubmVsLmlkfT8ke3BhcmFtcy50b1N0cmluZygpfWA7XHJcblxyXG4gICAgICBjaGFubmVsLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICB0ZXh0OiBgSSd2ZSBzdGFydGVkIGEgZ3VpZGVkIHZpZGVvIGNhbGwgKCR7c2Vzc2lvbkNvbmZpZz8ubW9kZSB8fCBcImNhc3VhbFwifSwgJHtzZXNzaW9uQ29uZmlnPy5kaWZmaWN1bHR5IHx8IFwiYmVnaW5uZXJcIn0pLiBKb2luIG1lOiAke2NhbGxVcmx9YCxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0b2FzdC5zdWNjZXNzKFwiVmlkZW8gY2FsbCBsaW5rIHNlbnQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAobG9hZGluZyB8fCAhY2hhdENsaWVudCB8fCAhY2hhbm5lbCkgcmV0dXJuIDxDaGF0TG9hZGVyIC8+O1xyXG5cclxuICBjb25zdCBwYXJ0bmVyTWVtYmVyID0gT2JqZWN0LnZhbHVlcyhjaGFubmVsLnN0YXRlPy5tZW1iZXJzIHx8IHt9KS5maW5kKFxyXG4gICAgKG1lbWJlcikgPT4gbWVtYmVyPy51c2VyPy5pZCAhPT0gYXV0aFVzZXIuX2lkXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgcGFydG5lciA9IHtcclxuICAgIG5hbWU6IHBhcnRuZXJNZW1iZXI/LnVzZXI/Lm5hbWUsXHJcbiAgICBpbWFnZTogcGFydG5lck1lbWJlcj8udXNlcj8uaW1hZ2UgfHwgYXV0aFVzZXI/LnByb2ZpbGVQaWMsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhdC13b3Jrc3BhY2UtcGFnZSBtaW4taC1bY2FsYygxMDB2aC00cmVtKV0gb3ZlcmZsb3cteS1hdXRvIHAtMiBzbTpwLTRcIj5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGF0LXdvcmtzcGFjZS1ncmlkIGgtZnVsbFwiPlxyXG4gICAgICAgIDxDaGF0V29ya3NwYWNlU2lkZWJhclxyXG4gICAgICAgICAgcGFydG5lcj17cGFydG5lcn1cclxuICAgICAgICAgIG9uRm9jdXNJbnB1dD17Zm9jdXNDaGF0SW5wdXR9XHJcbiAgICAgICAgICBvblRvZ2dsZVZvaWNlPXt0b2dnbGVWb2ljZVR5cGluZ31cclxuICAgICAgICAgIGlzTGlzdGVuaW5nPXtpc0xpc3RlbmluZ31cclxuICAgICAgICAgIHZvaWNlU3VwcG9ydGVkPXtzcGVlY2hTdXBwb3J0ZWR9XHJcbiAgICAgICAgICBvblN0YXJ0Q2FsbD17KCkgPT4gaGFuZGxlVmlkZW9DYWxsKHsgbW9kZTogXCJndWlkZWRcIiwgZGlmZmljdWx0eTogXCJiZWdpbm5lclwiLCBkdXJhdGlvbjogMTUgfSl9XHJcbiAgICAgICAgLz5cclxuXHJcbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwibWluLXctMCBmbGV4IGZsZXgtY29sIGdhcC0zXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTIgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJhc2UtMzAwIGJnLWJhc2UtMjAwLzcwIHB4LTMgcHktMlwiPlxyXG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZCB0ZXh0LWxnXCI+Q2hhdCBXb3Jrc3BhY2U8L2gyPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGJ0biBidG4tc20gYnRuLWNpcmNsZSAke2lzTGlzdGVuaW5nID8gXCJidG4tZXJyb3JcIiA6IFwiYnRuLW91dGxpbmVcIn1gfVxyXG4gICAgICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlVm9pY2VUeXBpbmd9XHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXNwZWVjaFN1cHBvcnRlZH1cclxuICAgICAgICAgICAgICAgIHRpdGxlPXtcclxuICAgICAgICAgICAgICAgICAgIXNwZWVjaFN1cHBvcnRlZFxyXG4gICAgICAgICAgICAgICAgICAgID8gXCJTcGVlY2ggcmVjb2duaXRpb24gaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogaXNMaXN0ZW5pbmdcclxuICAgICAgICAgICAgICAgICAgICAgID8gXCJTdG9wIHZvaWNlIHR5cGluZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwiU3RhcnQgdm9pY2UgdHlwaW5nXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7aXNMaXN0ZW5pbmcgPyA8TWljT2ZmSWNvbiBjbGFzc05hbWU9XCJzaXplLVsxLjJyZW1dXCIgLz4gOiA8TWljSWNvbiBjbGFzc05hbWU9XCJzaXplLVsxLjJyZW1dXCIgLz59XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGF0LXBhbmVsIGNhcmQgYm9yZGVyIGJvcmRlci1iYXNlLTMwMCBzaGFkb3ctc20gbWluLWgtWzYydmhdIGZsZXgtMVwiIHJlZj17Y2hhdFNoZWxsUmVmfT5cclxuICAgICAgICAgICAgPENoYXQgY2xpZW50PXtjaGF0Q2xpZW50fT5cclxuICAgICAgICAgICAgICA8Q2hhbm5lbCBjaGFubmVsPXtjaGFubmVsfT5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHJlbGF0aXZlIGgtZnVsbFwiPlxyXG4gICAgICAgICAgICAgICAgICA8Q2FsbEJ1dHRvbiBoYW5kbGVWaWRlb0NhbGw9e2hhbmRsZVZpZGVvQ2FsbH0gLz5cclxuICAgICAgICAgICAgICAgICAgPFdpbmRvdz5cclxuICAgICAgICAgICAgICAgICAgICA8Q2hhbm5lbEhlYWRlciAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxNZXNzYWdlTGlzdCAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhdC1pbnB1dC1kb2NrXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGJ0biBidG4tc20gYnRuLWNpcmNsZSAke2lzTGlzdGVuaW5nID8gXCJidG4tZXJyb3JcIiA6IFwiYnRuLWdob3N0XCJ9YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlVm9pY2VUeXBpbmd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshc3BlZWNoU3VwcG9ydGVkfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17aXNMaXN0ZW5pbmcgPyBcIlN0b3Agdm9pY2UgdHlwaW5nXCIgOiBcIlN0YXJ0IHZvaWNlIHR5cGluZ1wifVxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7aXNMaXN0ZW5pbmcgPyA8TWljT2ZmSWNvbiBjbGFzc05hbWU9XCJzaXplLVsxLjJyZW1dXCIgLz4gOiA8TWljSWNvbiBjbGFzc05hbWU9XCJzaXplLVsxLjJyZW1dXCIgLz59XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxNZXNzYWdlSW5wdXQgZm9jdXMgLz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9XaW5kb3c+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxUaHJlYWQgLz5cclxuICAgICAgICAgICAgICA8L0NoYW5uZWw+XHJcbiAgICAgICAgICAgIDwvQ2hhdD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59O1xyXG5leHBvcnQgZGVmYXVsdCBDaGF0UGFnZTsiXSwiZmlsZSI6IkM6L1VzZXJzL1lhc2gvRGVza3RvcC9Wb3hvcmEvZnJvbnRlbmQvc3JjL3BhZ2VzL0NoYXRQYWdlLmpzeCJ9