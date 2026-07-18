import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { AVAILABILITY_OPTIONS, LANGUAGES } from "../constants";
import { SearchIcon, SparklesIcon } from "lucide-react";

const defaultFilters = {
  q: "",
  nativeLanguage: "",
  learningLanguage: "",
  availability: "",
  location: "",
};

const FriendsPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [allFriends, setAllFriends] = useState([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["friends", "list", filters, page],
    queryFn: () => getUserFriends({ ...filters, page, limit: 12 }),
  });

  const friends = allFriends;
  const hasMore = data?.pagination?.hasMore;

  useEffect(() => {
    const pageFriends = data?.friends || [];

    if (page === 1) {
      setAllFriends(pageFriends);
      return;
    }

    setAllFriends((prev) => {
      const map = new Map(prev.map((friend) => [friend._id, friend]));
      pageFriends.forEach((friend) => map.set(friend._id, friend));
      return [...map.values()];
    });
  }, [data, page]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setAllFriends([]);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="page-header">
          <p className="badge badge-primary gap-1 px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold w-fit bg-primary/10 border-primary/20">
            <SparklesIcon className="size-3 text-primary animate-pulse" />
            Social Circle
          </p>
          <h1 className="page-header-title mt-2">Your Friends</h1>
          <p className="page-header-subtitle">
            Manage your language connections, filter by fluent language, target goals, or status.
          </p>
        </div>

        {/* Filters Card */}
        <div className="card bg-base-200/50 border border-primary/10 hover:border-primary/20 transition-all duration-300">
          <div className="card-body p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="input input-bordered flex items-center gap-2 sm:col-span-2 lg:col-span-2 bg-base-100/50 border-primary/10 focus-within:border-primary transition-all">
              <SearchIcon className="size-4 opacity-40 text-primary" />
              <input
                type="text"
                className="grow text-sm placeholder-base-content/30"
                placeholder="Search by name…"
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
              />
            </label>

            <select
              className="select select-bordered bg-base-100/50 border-primary/10 hover:border-primary/20 focus:border-primary focus:bg-base-100 transition-all text-sm"
              value={filters.nativeLanguage}
              onChange={(e) => handleFilterChange("nativeLanguage", e.target.value)}
            >
              <option value="">Native language</option>
              {LANGUAGES.map((lang) => (
                <option key={`friend-native-${lang}`} value={lang.toLowerCase()}>
                  {lang}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered bg-base-100/50 border-primary/10 hover:border-primary/20 focus:border-primary focus:bg-base-100 transition-all text-sm"
              value={filters.learningLanguage}
              onChange={(e) => handleFilterChange("learningLanguage", e.target.value)}
            >
              <option value="">Learning language</option>
              {LANGUAGES.map((lang) => (
                <option key={`friend-learning-${lang}`} value={lang.toLowerCase()}>
                  {lang}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered bg-base-100/50 border-primary/10 hover:border-primary/20 focus:border-primary focus:bg-base-100 transition-all text-sm"
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
              className="input input-bordered sm:col-span-2 lg:col-span-2 bg-base-100/50 border-primary/10 hover:border-primary/20 focus:border-primary focus:bg-base-100 transition-all text-sm placeholder-base-content/30"
              placeholder="Location…"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />

            <button
              className="btn btn-ghost btn-sm h-auto min-h-0 py-2 hover:bg-base-300"
              onClick={() => {
                setFilters(defaultFilters);
                setPage(1);
                setAllFriends([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="btn btn-outline btn-sm gap-2"
                disabled={!hasMore || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                {isFetching ? "Loading..." : hasMore ? "Load More Friends" : "No More Friends"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
