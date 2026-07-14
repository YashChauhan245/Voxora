import { useQuery } from "@tanstack/react-query";
import { getProgressDashboard, getStreamToken } from "../lib/api";
import { FlameIcon, GlobeIcon, MicIcon, PodcastIcon, MessageSquareIcon, ArrowRightIcon } from "lucide-react";
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
      whileHover={{ y: -5, scale: 1.02 }}
      className="card bg-base-200 border border-primary/20 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-glow-sm cursor-default"
    >
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-70 font-medium">{title}</p>
          <div className="p-2 rounded-xl bg-base-300/40">
            <IconComponent className={`size-5 ${color}`} />
          </div>
        </div>
        <p ref={numRef} className="text-3xl font-bold mt-2 font-display tracking-tight">
          0{suffix}
        </p>
      </div>
    </motion.div>
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
        // Connect if not already connected
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

        // Query active messaging channels
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Progress Dashboard</h1>
          <p className="opacity-70 mt-1">Track your language journey and weekly consistency.</p>
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
                    staggerChildren: 0.12,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
              className="card bg-base-200 border border-primary/20"
            >
              <div className="card-body p-5">
                <h2 className="text-xl font-semibold tracking-tight">Recent Chats</h2>

                {loadingChats ? (
                  <div className="flex items-center gap-2 py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                    <span className="text-sm opacity-70">Loading recent chats...</span>
                  </div>
                ) : recentChats.length === 0 ? (
                  <p className="opacity-70 text-sm py-2">No recent chats. Head over to Home to connect with language partners!</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 mt-3">
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
                            className="flex items-center justify-between bg-base-100/60 hover:bg-base-100/90 rounded-xl p-3 border border-primary/15 hover:border-primary/45 transition-all duration-300 group hover:shadow-glow-sm cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-10 rounded-full ring-1 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
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
                                <p className="font-semibold text-sm leading-none group-hover:text-primary transition-all duration-300">
                                  {chat.user.name || "Language Partner"}
                                </p>
                                <p className="text-xs opacity-60 truncate mt-1 max-w-[200px] sm:max-w-md">
                                  {chat.lastMessage?.text || "Started a conversation"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {chat.lastMessageAt && (
                                <span className="text-[10px] sm:text-xs opacity-50">
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
