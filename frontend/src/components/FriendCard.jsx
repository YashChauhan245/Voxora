import { Link } from "react-router";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { getLanguageFlag } from "../lib/languageFlags";
import { MessageCircleIcon, TargetIcon } from "lucide-react";
import { motion } from "framer-motion";

const FriendCard = ({ friend }) => {
  // Deterministic values for profile cards based on MongoDB _id
  const idStr = friend._id || "default";
  
  const responseRates = ["Replies instantly", "Replies in minutes", "Replies in hours", "Highly active"];
  const rate = responseRates[idStr.charCodeAt(idStr.length - 3) % responseRates.length];
  
  const goals = ["Casual practice", "Fluency & slang", "Business context", "Accent training"];
  const goal = goals[idStr.charCodeAt(0) % goals.length];

  const availability = friend.availability || "available";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card group cursor-pointer bg-base-200 border border-primary/15 shadow-md hover:border-primary/35 hover:shadow-glow-sm transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative subtle ambient card glow in the background */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full pointer-events-none" />

      <div className="card-body p-4.5 gap-0 relative z-10 flex flex-col justify-between h-full">
        <div>

          {/* Avatar + name */}
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="relative flex-shrink-0">
              <img
                src={getProfileImage(friend.profilePic, friend.fullName)}
                alt={friend.fullName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/25 group-hover:ring-primary/45 transition-all duration-300 shadow-md"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAvatarFallback(friend.fullName);
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-200 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-base-content truncate tracking-tight">{friend.fullName}</h3>
              <p className="text-[9px] text-base-content/40 font-bold mt-0.5 uppercase tracking-widest truncate">{rate}</p>
            </div>
          </div>

          {/* Language badges */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-base-content/30 w-12 font-bold uppercase tracking-wider shrink-0">Native:</span>
              <span className="badge bg-secondary/15 border-secondary/25 text-secondary text-[10.5px] font-bold px-2 py-0.5 h-auto">
                {getLanguageFlag(friend.nativeLanguage)}&nbsp;{friend.nativeLanguage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-base-content/30 w-12 font-bold uppercase tracking-wider shrink-0">Learn:</span>
              <span className="badge bg-primary/10 border-primary/25 text-primary text-[10.5px] font-bold px-2 py-0.5 h-auto">
                {getLanguageFlag(friend.learningLanguage)}&nbsp;{friend.learningLanguage}
              </span>
            </div>
          </div>

          {/* Speaking Goal */}
          <div className="flex items-center gap-1.5 py-2 px-2.5 rounded-lg bg-base-100/40 border border-primary/5 mb-4">
            <TargetIcon className="size-3 text-base-content/30 shrink-0" />
            <span className="text-[10px] text-base-content/45 font-medium truncate">Goal: <span className="text-base-content/75 font-semibold">{goal}</span></span>
          </div>
        </div>

        {/* Action Button: Message */}
        <div className="w-full flex items-center justify-between gap-2.5 mt-auto">
          <div className="text-[9.5px] text-base-content/30 font-bold uppercase tracking-wider">
            {availability}
          </div>
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-xs sm:btn-sm btn-outline border-primary/20 bg-base-100/40 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200 text-xs font-semibold px-4"
          >
            <MessageCircleIcon className="size-3.5" />
            Message
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default FriendCard;

// getLanguageFlag is imported from src/lib/languageFlags.js