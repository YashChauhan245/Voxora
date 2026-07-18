import { BellIcon } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="card bg-base-200/40 border border-primary/10 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center">
      <div className="size-12 rounded-full bg-base-300/40 text-base-content/30 flex items-center justify-center mb-5">
        <BellIcon className="size-5" />
      </div>
      <h3 className="font-bold text-base-content text-sm tracking-tight mb-1.5">All caught up</h3>
      <p className="text-xs text-base-content/40 max-w-xs leading-relaxed">
        No new alerts or partner request updates. We'll ping you when actions require your review.
      </p>
    </div>
  );
}

export default NoNotificationsFound;