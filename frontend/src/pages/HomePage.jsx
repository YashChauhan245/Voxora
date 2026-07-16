import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  MapPinIcon,
  SearchIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

import FriendCard from "../components/FriendCard";
import { getLanguageFlag } from "../lib/languageFlags";
import NoFriendsFound from "../components/NoFriendsFound";
import { AVAILABILITY_OPTIONS, LANGUAGES } from "../constants";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const defaultFilters = {
  q: "",
  nativeLanguage: "",
  learningLanguage: "",
  location: "",
  availability: "",
};

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [allRecommendedUsers, setAllRecommendedUsers] = useState([]);

  const friendsQuery = useQuery({
    queryKey: ["friends", "home-preview"],
    queryFn: () => getUserFriends({ page: 1, limit: 8 }),
  });

  const usersQuery = useQuery({
    queryKey: ["users", filters, page],
    queryFn: () => getRecommendedUsers({ ...filters, page, limit: 9 }),
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: () => getOutgoingFriendReqs({ page: 1, limit: 100 }),
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    const requests = outgoingFriendReqs?.requests || [];
    requests.forEach((req) => outgoingIds.add(req.recipient._id));
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  useEffect(() => {
    const users = usersQuery.data?.users || [];
    if (page === 1) {
      setAllRecommendedUsers(users);
      return;
    }
    setAllRecommendedUsers((prev) => {
      const map = new Map(prev.map((user) => [user._id, user]));
      users.forEach((user) => map.set(user._id, user));
      return [...map.values()];
    });
  }, [usersQuery.data, page]);

  const friends = friendsQuery.data?.friends || [];
  const hasMoreUsers = usersQuery.data?.pagination?.hasMore;

  const handleFilterChange = (key, value) => {
    setPage(1);
    setAllRecommendedUsers([]);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  return (
    <div className="p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto space-y-12">

      {/* ── YOUR FRIENDS SECTION ── */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">Your Friends</h2>
            <p className="text-sm text-base-content/40 mt-0.5">
              {friends.length > 0 ? `${friends.length} friend${friends.length === 1 ? "" : "s"} online` : "No friends yet — discover people below"}
            </p>
          </div>
          <Link to="/notifications" className="btn btn-sm btn-outline gap-2 shrink-0">
            <UsersIcon className="size-3.5" />
            Friend Requests
          </Link>
        </div>

        {friendsQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {friends.map((friend) => (
              <motion.div
                key={friend._id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } }
                }}
              >
                <FriendCard friend={friend} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── DISCOVER SECTION ── */}
      <section>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-base-content tracking-tight">Meet New Learners</h2>
            <p className="text-sm text-base-content/40 mt-0.5">
              Discover language exchange partners matched to your profile
            </p>
          </div>
          {activeFilterCount > 0 && (
            <button
              className="btn btn-sm btn-ghost text-base-content/50 hover:text-base-content gap-1.5"
              onClick={() => {
                setFilters(defaultFilters);
                setPage(1);
                setAllRecommendedUsers([]);
              }}
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="rounded-2xl p-4.5 mb-8 bg-gradient-to-b from-base-200/80 to-base-200/35 border border-primary/20 backdrop-blur-md shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {/* Search */}
            <label className="input input-bordered flex items-center gap-2.5 sm:col-span-2 lg:col-span-2 bg-base-100/40 border-primary/15 hover:border-primary/30 transition-all">
              <SearchIcon className="size-4 text-base-content/40 shrink-0" />
              <input
                type="text"
                className="grow text-sm bg-transparent border-none outline-none text-base-content placeholder:text-base-content/30"
                placeholder="Search by name…"
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
              />
            </label>

            {/* Native language */}
            <select
              className="select select-bordered text-sm bg-base-100/40 border-primary/15 hover:border-primary/30 transition-all"
              value={filters.nativeLanguage}
              onChange={(e) => handleFilterChange("nativeLanguage", e.target.value)}
            >
              <option value="" className="bg-black text-white">Native language</option>
              {LANGUAGES.map((lang) => (
                <option key={`native-filter-${lang}`} value={lang.toLowerCase()} className="bg-black text-white">
                  {lang}
                </option>
              ))}
            </select>

            {/* Learning language */}
            <select
              className="select select-bordered text-sm bg-base-100/40 border-primary/15 hover:border-primary/30 transition-all"
              value={filters.learningLanguage}
              onChange={(e) => handleFilterChange("learningLanguage", e.target.value)}
            >
              <option value="" className="bg-black text-white">Learning language</option>
              {LANGUAGES.map((lang) => (
                <option key={`learning-filter-${lang}`} value={lang.toLowerCase()} className="bg-black text-white">
                  {lang}
                </option>
              ))}
            </select>

            {/* Availability */}
            <select
              className="select select-bordered text-sm bg-base-100/40 border-primary/15 hover:border-primary/30 transition-all"
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
            >
              <option value="" className="bg-black text-white">Availability</option>
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-black text-white">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User cards */}
        {usersQuery.isLoading && page === 1 ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : allRecommendedUsers.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-base-200/60 border border-primary/15">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-semibold text-base-content mb-1.5">No results found</h3>
            <p className="text-sm text-base-content/40">
              Try adjusting your filters or check back later for new language partners.
            </p>
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
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {allRecommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <motion.div
                    key={user._id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                    }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="rounded-2xl p-5 glow-hover transition-all duration-300 bg-base-200/70 border border-primary/20 shadow-sm hover:border-primary/45 hover:shadow-glow-sm cursor-default"
                  >
                    {/* User header */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getProfileImage(user.profilePic, user.fullName)}
                          alt={user.fullName}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getAvatarFallback(user.fullName);
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content text-base truncate">
                          {user.fullName}
                        </h3>
                        {user.location && (
                          <div className="flex items-center gap-1 text-xs text-base-content/40 mt-0.5">
                            <MapPinIcon className="size-3 shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}
                        <div className="mt-1.5">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-base-100/50 text-base-content/60">
                            {user.availability || "available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="badge badge-secondary text-[10px] px-2 py-1 h-auto">
                        {getLanguageFlag(user.nativeLanguage)}&nbsp;
                        Native: {capitialize(user.nativeLanguage)}
                      </span>
                      <span className="badge badge-outline text-[10px] px-2 py-1 h-auto">
                        {getLanguageFlag(user.learningLanguage)}&nbsp;
                        Learning: {capitialize(user.learningLanguage)}
                      </span>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-base-content/40 line-clamp-2 mb-4 leading-relaxed">
                        {user.bio}
                      </p>
                    )}

                    {/* CTA */}
                    <button
                      className={`btn btn-sm w-full gap-2 ${
                        hasRequestBeenSent ? "opacity-50 pointer-events-none" : "btn-primary"
                      }`}
                      onClick={() => sendRequestMutation(user._id)}
                      disabled={hasRequestBeenSent || isPending}
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircleIcon className="size-3.5" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-3.5" />
                          Connect
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Load more */}
            <div className="flex justify-center mt-8">
              <button
                className="btn btn-outline gap-2 px-8"
                disabled={!hasMoreUsers || usersQuery.isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                {usersQuery.isFetching ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Loading…
                  </>
                ) : hasMoreUsers ? (
                  <>
                    <ChevronDownIcon className="size-4" />
                    Load More
                  </>
                ) : (
                  "You've seen everyone 🎉"
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
