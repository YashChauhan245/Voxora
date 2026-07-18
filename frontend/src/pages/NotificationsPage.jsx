import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, SparklesIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { getAvatarFallback, getProfileImage } from "../lib/utils";
import { motion } from "framer-motion";

const dedupeById = (list) => {
  const map = new Map();
  list.forEach((item) => map.set(item._id, item));
  return [...map.values()];
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  const { data: friendRequests, isLoading, isFetching } = useQuery({
    queryKey: ["friendRequests", page],
    queryFn: () => getFriendRequests({ page, limit: 8 }),
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts"] });
    },
  });

  useEffect(() => {
    if (!friendRequests) return;

    if (page === 1) {
      setIncomingRequests(friendRequests.incomingReqs || []);
      setAcceptedRequests(friendRequests.acceptedReqs || []);
      return;
    }

    setIncomingRequests((prev) => dedupeById([...prev, ...(friendRequests.incomingReqs || [])]));
    setAcceptedRequests((prev) => dedupeById([...prev, ...(friendRequests.acceptedReqs || [])]));
  }, [friendRequests, page]);

  const pagination = friendRequests?.pagination;
  const hasMore = useMemo(
    () => Boolean(pagination?.incomingHasMore || pagination?.acceptedHasMore),
    [pagination]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        
        {/* Page Header */}
        <div className="page-header">
          <p className="badge badge-primary gap-1 px-2.5 py-1 text-[10px] tracking-wider uppercase font-bold w-fit bg-primary/10 border-primary/20">
            <SparklesIcon className="size-3 text-primary animate-pulse" />
            Activity Feed
          </p>
          <h1 className="page-header-title mt-2">Notifications</h1>
          <p className="page-header-subtitle">
            Review friend requests, new language partner approvals, and community invites.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-2">
                  <UserCheckIcon className="h-4 w-4 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary text-[10px] px-2 py-0.5">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card bg-base-200 border border-primary/15 hover:border-primary/25 transition-all shadow-sm"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="avatar w-12 h-12 rounded-full bg-base-300 flex-shrink-0 ring-2 ring-primary/15">
                              <img
                                src={getProfileImage(request.sender.profilePic, request.sender.fullName)}
                                alt={request.sender.fullName}
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getAvatarFallback(request.sender.fullName);
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-base-content leading-tight">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <span className="badge bg-secondary/10 border-secondary/20 text-secondary text-[9.5px] font-semibold">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge bg-base-100 border-primary/10 text-base-content/70 text-[9.5px] font-semibold">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm w-full sm:w-auto flex-shrink-0 text-xs font-bold"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept Request
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-2">
                  <BellIcon className="h-4 w-4 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <motion.div 
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card bg-base-200 border border-primary/15 hover:border-primary/25 shadow-sm"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="avatar size-10 rounded-full flex-shrink-0 ring-2 ring-primary/15">
                              <img
                                src={getProfileImage(
                                  notification.recipient.profilePic,
                                  notification.recipient.fullName
                                )}
                                className="rounded-full object-cover"
                                alt={notification.recipient.fullName}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getAvatarFallback(
                                    notification.recipient.fullName
                                  );
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-base-content leading-tight">{notification.recipient.fullName}</h3>
                              <p className="text-xs text-base-content/60 mt-1">
                                accepted your friend request. Say hello!
                              </p>
                              <p className="text-[10px] flex items-center opacity-30 mt-1">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Recently
                              </p>
                            </div>
                          </div>
                          <div className="badge badge-success text-[10px] font-bold px-2.5 py-0.5 shrink-0 self-start sm:self-center">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}

            {(incomingRequests.length > 0 || acceptedRequests.length > 0) && (
              <div className="flex justify-center mt-6">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={!hasMore || isFetching}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {isFetching ? "Loading..." : hasMore ? "Load More" : "No More Notifications"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
