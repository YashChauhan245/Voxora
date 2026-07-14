import { Link } from "react-router";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { getLanguageFlag } from "../lib/languageFlags";
import { MessageCircleIcon } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const FriendCard = ({ friend }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.025 }}
      className="card glow-hover group cursor-pointer bg-gradient-to-b from-base-200/80 to-base-200/40 border border-primary/20 shadow-md hover:border-primary/45 hover:shadow-glow-sm transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative subtle ambient card glow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl rounded-full pointer-events-none" />

      <div className="card-body p-4.5 gap-0 relative z-10">
        {/* Avatar + name */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="relative flex-shrink-0">
            <img
              src={getProfileImage(friend.profilePic, friend.fullName)}
              alt={friend.fullName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/25 group-hover:ring-primary/50 transition-all duration-300 shadow-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getAvatarFallback(friend.fullName);
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-200 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-base-content/95 truncate tracking-tight">{friend.fullName}</h3>
            <p className="text-[10px] text-green-400 font-semibold mt-0.5 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse shadow-[0_0_4px_#22c55e]" />
              Online
            </p>
          </div>
        </div>

        {/* Language badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge bg-secondary/10 border-secondary/20 text-secondary text-[10px] font-semibold px-2.5 py-1 h-auto">
            {getLanguageFlag(friend.nativeLanguage)}&nbsp;{friend.nativeLanguage}
          </span>
          <span className="badge bg-base-100/50 border-primary/15 text-base-content/75 text-[10px] font-semibold px-2.5 py-1 h-auto">
            {getLanguageFlag(friend.learningLanguage)}&nbsp;{friend.learningLanguage}
          </span>
        </div>

        {/* Chat button */}
        <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.015 }} className="w-full">
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-xs sm:btn-sm btn-outline w-full gap-2 border-primary/25 bg-base-100/40 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200 text-xs font-semibold"
          >
            <MessageCircleIcon className="size-3.5" />
            Message
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default FriendCard;

// `getLanguageFlag` moved to `src/lib/languageFlags.js` to keep this file
// exporting only the component so React Fast Refresh works correctly.