import {
  LanguagesIcon,
  MessageCircleIcon,
  VideoIcon,
} from "lucide-react";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

const ChatWorkspaceSidebar = ({
  partner,
  onFocusInput,
  onStartCall,
}) => {
  return (
    <aside className="hidden lg:flex flex-col rounded-2xl border border-primary/15 bg-base-100/80 backdrop-blur p-4 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-primary/15">
        <div className="avatar">
          <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              src={getProfileImage(partner?.image, partner?.name)}
              alt={partner?.name || "Friend"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getAvatarFallback(partner?.name);
              }}
            />
          </div>
        </div>
        <div>
          <p className="font-semibold leading-tight">{partner?.name || "Conversation"}</p>
          <p className="text-xs opacity-70">Live language practice</p>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <button className="btn btn-sm btn-primary w-full justify-start" onClick={onFocusInput}>
          <MessageCircleIcon className="size-4" />
          Jump to message input
        </button>

        <button className="btn btn-sm btn-outline w-full justify-start" onClick={onStartCall}>
          <VideoIcon className="size-4" />
          Start guided call
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-primary/15 space-y-3 text-sm">
        <div className="flex items-center gap-2 opacity-80">
          <LanguagesIcon className="size-4" />
          <span>Tip: use short voice sentences for better results.</span>
        </div>
      </div>
    </aside>
  );
};

export default ChatWorkspaceSidebar;
