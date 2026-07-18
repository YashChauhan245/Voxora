import { useQuery } from "@tanstack/react-query";
import { getProgressDashboard, getStreamToken } from "../lib/api";
import { FlameIcon, GlobeIcon, MicIcon, PodcastIcon, MessageSquareIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { Link } from "react-router";

const MetricCard = ({ title, value, icon, color }) => {
  const IconComponent = icon;
  const numRef = useRef(null);

  // Extract the numeric part of the value and the suffix (like " days")
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const suffix = typeof value === "string" ? value.replace(/[0-9.]/g, "") : "";

  useEffect(() => {
    if (!numRef.current) return;
    const target = { val: 0 };
    gsap.to(target, {
      val: numericValue,
      duration: 1.5,
      ease: "power3.out",
      onUpdate: () => {
        if (numRef.current) {
          numRef.current.innerText = `${Math.floor(target.val)}${suffix}`;
        }
      },
    });
  }, [numericValue, suffix]);

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="card bg-base-200 border border-primary/15 shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-glow-sm cursor-default"
    >
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] opacity-50 uppercase tracking-wider font-bold font-display">{title}</p>
          <div className="p-2 rounded-xl bg-primary/10">
            <IconComponent className={`size-4.5 ${color}`} />
          </div>
        </div>
        <p ref={numRef} className="text-3xl font-bold mt-2 font-display tracking-tight text-base-content">
          0{suffix}
        </p>
      </div>
    </motion.div>
  );
};

/* ── Minimalist SVG Weekly Speaking Activity Chart ── */
const WeeklySpeakingChart = () => {
  const data = [12, 24, 15, 30, 45, 20, 18];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxVal = 50;
  
  return (
    <div className="card bg-base-200 border border-primary/15 p-5 hover:border-primary/25 transition-all duration-300">
      <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-5">Weekly Speaking (Minutes)</h3>
      <div className="flex items-end justify-between h-32 gap-3 pt-2">
        {data.map((val, idx) => {
          const pct = (val / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-default relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 absolute bottom-full pb-1 shadow-md z-10 whitespace-nowrap">
                {val} mins
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.05 }}
                className="w-full rounded-t-[4px] bg-gradient-to-t from-primary/40 to-primary group-hover:from-primary group-hover:to-accent transition-all duration-300 shadow-[0_0_8px_oklch(var(--p)/0.1)]"
              />
              <span className="text-[10px] text-base-content/25 mt-2.5 font-bold uppercase tracking-wider">{days[idx]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Language Practice Distribution Chart ── */
const LanguageDistribution = () => {
  const languages = [
    { lang: "Japanese", pct: 55, color: "bg-primary", flag: "🇯🇵" },
    { lang: "Spanish", pct: 30, color: "bg-secondary", flag: "🇪🇸" },
    { lang: "French", pct: 15, color: "bg-accent", flag: "🇫🇷" }
  ];
  
  return (
    <div className="card bg-base-200 border border-primary/15 p-5 hover:border-primary/25 transition-all duration-300">
      <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-5">Language Practice</h3>
      <div className="space-y-4">
        {/* Visual stacked progress bar */}
        <div className="h-3 w-full rounded-full bg-base-100 border border-primary/10 overflow-hidden flex">
          {languages.map((l, i) => (
            <div key={i} className={`h-full ${l.color} transition-all duration-500`} style={{ width: `${l.pct}%` }} />
          ))}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {languages.map((l, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs shrink-0">{l.flag}</span>
                <span className="text-[11px] text-base-content/40 font-semibold truncate">{l.lang}</span>
              </div>
              <span className="text-base font-bold text-base-content/85 mt-0.5">{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Pronunciation Sparkline Trend ── */
const PronunciationTrend = () => {
  return (
    <div className="card bg-base-200 border border-primary/15 p-5 hover:border-primary/25 transition-all duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Pronunciation Score</h3>
        <p className="text-[10px] text-base-content/30 mb-5">Trend from your recent voice analysis sessions.</p>
      </div>
      <div className="relative h-20 w-full mt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(var(--p))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="oklch(var(--p))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 30 L 0 25 L 25 18 L 50 22 L 75 12 L 100 8 L 100 30 Z" 
            fill="url(#sparklineGrad)" 
          />
          <path 
            d="M 0 25 L 25 18 L 50 22 L 75 12 L 100 8" 
            fill="none" 
            stroke="oklch(var(--p))" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="25" r="1.5" fill="oklch(var(--s))" />
          <circle cx="25" cy="18" r="1.5" fill="oklch(var(--s))" />
          <circle cx="50" cy="22" r="1.5" fill="oklch(var(--s))" />
          <circle cx="75" cy="12" r="1.5" fill="oklch(var(--s))" />
          <circle cx="100" cy="8" r="2" fill="oklch(var(--p))" />
        </svg>
        <div className="absolute top-0 right-0 bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
          87% Avg
        </div>
      </div>
    </div>
  );
};

/* ── AI Coach Insights Summary ── */
const AIFeedbackSummary = () => {
  const tips = [
    { icon: "🎯", text: "Great Keigo conjugation in polite Japanese contexts." },
    { icon: "🗣️", text: "Spanish rolling 'r' could be rolled slightly longer." },
    { icon: "🧠", text: "Auxiliary verb choice in German movement clauses is excellent." }
  ];
  return (
    <div className="card bg-base-200 border border-primary/15 p-5 hover:border-primary/25 transition-all duration-300">
      <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-4">AI Coach Insights</h3>
      <div className="space-y-3.5">
        {tips.map((t, idx) => (
          <div key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-base-content/60">
            <span className="text-base shrink-0">{t.icon}</span>
            <p className="mt-0.5">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Achievements Unlocked ── */
const AchievementsGrid = () => {
  const achievements = [
    { icon: "🏆", title: "Streak Master", desc: "7-day consistency streak" },
    { icon: "🗣️", title: "Polyglot", desc: "Practiced 3+ languages" },
    { icon: "🤝", title: "Global Connector", desc: "Connected with partners globally" }
  ];
  return (
    <div className="card bg-base-200 border border-primary/15">
      <div className="card-body p-5">
        <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-4">Achievements Unlocked</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-base-100/30 border border-primary/10 rounded-xl p-3.5 hover:border-primary/25 transition-all duration-300">
              <span className="text-2xl shrink-0">{a.icon}</span>
              <div>
                <div className="text-[12px] font-bold text-base-content/85">{a.title}</div>
                <div className="text-[10px] text-base-content/40 mt-0.5">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { authUser } = useAuthUser();
  const { data, isLoading } = useQuery({
    queryKey: ["progressDashboard"],
    queryFn: getProgressDashboard,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const [recentChats, setRecentChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        const channels = await client.queryChannels(
          {
            type: "messaging",
            members: { $in: [authUser._id] },
          },
          { last_message_at: -1 },
          { limit: 5 }
        );

        const chatUsers = channels
          .map((channel) => {
            const otherMember = Object.values(channel.state?.members || {}).find(
              (m) => m.user?.id !== authUser._id
            );
            
            return {
              channelId: channel.id,
              user: otherMember?.user || { id: "unknown", name: "User" },
              lastMessage: channel.state?.messages[channel.state?.messages.length - 1],
              lastMessageAt: channel.state?.last_message_at,
            };
          })
          .filter((item) => item.user.id !== "unknown");

        setRecentChats(chatUsers);
      } catch (err) {
        console.error("Error querying recent chats:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchRecentChats();
  }, [tokenData, authUser]);

  const metrics = data?.metrics || {
    minutesSpoken: 0,
    sessionsCompleted: 0,
    languagesPracticed: 0,
    streakDays: 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="page-header">
          <p className="badge badge-primary gap-1 px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold w-fit bg-primary/10 border-primary/20">
            <SparklesIcon className="size-3 text-primary" />
            Progress Analytics
          </p>
          <h1 className="page-header-title mt-2">Progress Dashboard</h1>
          <p className="page-header-subtitle">Track your language journey and weekly consistency.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3.5"
            >
              <MetricCard
                title="Minutes Spoken (7d)"
                value={metrics.minutesSpoken}
                icon={MicIcon}
                color="text-primary"
              />
              <MetricCard
                title="Sessions Completed"
                value={metrics.sessionsCompleted}
                icon={PodcastIcon}
                color="text-secondary"
              />
              <MetricCard
                title="Languages Practiced"
                value={metrics.languagesPracticed}
                icon={GlobeIcon}
                color="text-accent"
              />
              <MetricCard
                title="Current Streak"
                value={`${metrics.streakDays} days`}
                icon={FlameIcon}
                color="text-warning"
              />
            </motion.div>

            {/* Minimalist Bento Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeeklySpeakingChart />
              <LanguageDistribution />
              <PronunciationTrend />
              <AIFeedbackSummary />
            </div>

            {/* Achievements Section */}
            <AchievementsGrid />

            {/* Recent Chats Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="card bg-base-200 border border-primary/15"
            >
              <div className="card-body p-5">
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">Recent Conversations</h3>

                {loadingChats ? (
                  <div className="flex items-center gap-2 py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                    <span className="text-sm opacity-70">Loading recent chats...</span>
                  </div>
                ) : recentChats.length === 0 ? (
                  <p className="opacity-70 text-sm py-2">No recent chats. Head over to Home to connect with language partners!</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {recentChats.map((chat, index) => {
                      const fallback = getAvatarFallback(chat.user.name);
                      const profilePic = getProfileImage(chat.user.image, chat.user.name);
                      
                      return (
                        <motion.div
                          key={chat.channelId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                        >
                          <Link
                            to={`/chat/${chat.user.id}`}
                            className="flex items-center justify-between bg-base-100/40 hover:bg-base-100/90 rounded-xl p-3 border border-primary/10 hover:border-primary/30 transition-all duration-300 group hover:shadow-glow-sm cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-10 rounded-full ring-1 ring-primary/20 group-hover:ring-primary/45 transition-all duration-300">
                                  <img
                                    src={profilePic}
                                    alt={chat.user.name || "Friend"}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = fallback;
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm leading-none group-hover:text-primary transition-all duration-300 text-base-content/90">
                                  {chat.user.name || "Language Partner"}
                                </p>
                                <p className="text-[12px] opacity-45 truncate mt-1.5 max-w-[140px] sm:max-w-[200px] md:max-w-md">
                                  {chat.lastMessage?.text || "Started a conversation"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {chat.lastMessageAt && (
                                <span className="text-[11px] opacity-40">
                                  {new Date(chat.lastMessageAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                              <ArrowRightIcon className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all duration-300" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
