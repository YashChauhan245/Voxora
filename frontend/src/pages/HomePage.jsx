import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

import FriendCard from "../components/FriendCard";
import { getLanguageFlag } from "../lib/languageFlags";
import NoFriendsFound from "../components/NoFriendsFound";
import { AVAILABILITY_OPTIONS, LANGUAGES } from "../constants";

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

    requests.forEach((req) => {
      outgoingIds.add(req.recipient._id);
    });

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {friendsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>

              {activeFilterCount > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setPage(1);
                    setAllRecommendedUsers([]);
                  }}
                >
                  Clear Filters ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <label className="input input-bordered flex items-center gap-2 lg:col-span-2">
                  <SearchIcon className="size-4 opacity-70" />
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search by name"
                    value={filters.q}
                    onChange={(e) => handleFilterChange("q", e.target.value)}
                  />
                </label>

                <select
                  className="select select-bordered"
                  value={filters.nativeLanguage}
                  onChange={(e) => handleFilterChange("nativeLanguage", e.target.value)}
                >
                  <option value="">Native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-filter-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered"
                  value={filters.learningLanguage}
                  onChange={(e) => handleFilterChange("learningLanguage", e.target.value)}
                >
                  <option value="">Learning language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-filter-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange("availability", e.target.value)}
                >
                  <option value="">Availability</option>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>

                <input
                  className="input input-bordered lg:col-span-2"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
            </div>
          </div>

          {usersQuery.isLoading && page === 1 ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : allRecommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Try adjusting filters or check back later for new language partners.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allRecommendedUsers.map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                  return (
                    <div
                      key={user._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar size-16 rounded-full">
                            <img
                              src={getProfileImage(user.profilePic, user.fullName)}
                              alt={user.fullName}
                              className="rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getAvatarFallback(user.fullName);
                              }}
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg">{user.fullName}</h3>
                            {user.location && (
                              <div className="flex items-center text-xs opacity-70 mt-1">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                            <div className="badge badge-outline mt-2 text-xs">
                              {user.availability || "available"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <span className="badge badge-secondary">
                            {getLanguageFlag(user.nativeLanguage)}
                            Native: {capitialize(user.nativeLanguage)}
                          </span>
                          <span className="badge badge-outline">
                            {getLanguageFlag(user.learningLanguage)}
                            Learning: {capitialize(user.learningLanguage)}
                          </span>
                        </div>

                        {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                        <button
                          className={`btn w-full mt-2 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4 mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  className="btn btn-outline"
                  disabled={!hasMoreUsers || usersQuery.isFetching}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {usersQuery.isFetching ? "Loading..." : hasMoreUsers ? "Load More" : "No More Users"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
