import { useQuery } from "@tanstack/react-query";
import { getProgressDashboard } from "../lib/api";
import { FlameIcon, GlobeIcon, MicIcon, PodcastIcon } from "lucide-react";

const MetricCard = ({ title, value, icon, color }) => {
  const IconComponent = icon;

  return (
    <div className="card bg-base-200 border border-base-300">
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-70">{title}</p>
          <IconComponent className={`size-5 ${color}`} />
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["progressDashboard"],
    queryFn: getProgressDashboard,
  });

  const metrics = data?.metrics || {
    minutesSpoken: 0,
    sessionsCompleted: 0,
    languagesPracticed: 0,
    streakDays: 0,
  };

  const activities = data?.recentActivity || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Progress Dashboard</h1>
          <p className="opacity-70 mt-1">Track your language journey and weekly consistency.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
            </div>

            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-5">
                <h2 className="text-xl font-semibold">Recent Activity</h2>

                {activities.length === 0 ? (
                  <p className="opacity-70 text-sm">No activity yet. Start a chat or call to build streak.</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-100 rounded-lg px-3 py-2"
                      >
                        <p className="font-medium text-sm">{activity.eventType.replaceAll("_", " ")}</p>
                        <p className="text-xs opacity-70">
                          {activity.language || "general"} {activity.durationMinutes ? `• ${activity.durationMinutes} min` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
