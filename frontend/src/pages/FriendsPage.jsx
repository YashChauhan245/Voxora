import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { AVAILABILITY_OPTIONS, LANGUAGES } from "../constants";
import { SearchIcon } from "lucide-react";

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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>

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
                <option key={`friend-native-${lang}`} value={lang.toLowerCase()}>
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
                <option key={`friend-learning-${lang}`} value={lang.toLowerCase()}>
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

            <button
              className="btn btn-ghost lg:col-span-1"
              onClick={() => {
                setFilters(defaultFilters);
                setPage(1);
                setAllFriends([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
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

            <div className="flex justify-center mt-4">
              <button
                className="btn btn-outline"
                disabled={!hasMore || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                {isFetching ? "Loading..." : hasMore ? "Load More" : "No More Friends"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
