import { Link } from "react-router";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { getLanguageFlag } from "../lib/languageFlags";
import { MessageCircleIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="card glow-hover group cursor-pointer" style={{ background: "rgba(10,10,20,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="card-body p-4 gap-0">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={getProfileImage(friend.profilePic, friend.fullName)}
              alt={friend.fullName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getAvatarFallback(friend.fullName);
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a14] shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white/90 truncate">{friend.fullName}</h3>
            <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-[10px] px-2 py-1 h-auto">
            {getLanguageFlag(friend.nativeLanguage)}&nbsp;{friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-[10px] px-2 py-1 h-auto">
            {getLanguageFlag(friend.learningLanguage)}&nbsp;{friend.learningLanguage}
          </span>
        </div>

        {/* Chat button */}
        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-sm w-full gap-2 mt-1"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.75)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          <MessageCircleIcon className="size-3.5" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

// `getLanguageFlag` moved to `src/lib/languageFlags.js` to keep this file
// exporting only the component so React Fast Refresh works correctly.