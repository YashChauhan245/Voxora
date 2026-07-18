import { UsersIcon } from "lucide-react";
import { Link } from "react-router";

const NoFriendsFound = () => {
  return (
    <div className="card bg-base-200/50 border border-primary/10 rounded-2xl p-10 text-center max-w-lg mx-auto flex flex-col items-center justify-center hover:border-primary/20 transition-all duration-300">
      <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-[0_0_15px_oklch(var(--p)/0.15)]">
        <UsersIcon className="size-6" />
      </div>
      <h3 className="font-bold text-base-content text-base tracking-tight mb-2">No connections yet</h3>
      <p className="text-xs text-base-content/40 max-w-xs mx-auto leading-relaxed mb-6">
        Connect with language learners globally, share insights, and practice speaking together.
      </p>
      <Link to="/" className="btn btn-primary btn-sm px-6 text-xs font-bold shadow-glow-sm">
        Discover Partners
      </Link>
    </div>
  );
};

export default NoFriendsFound;