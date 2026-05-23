import ActivityEvent from "../models/ActivityEvent.js";

const formatDateKey = (date) => {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${d.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const calculateStreak = (events) => {
  if (!events.length) return 0;

  const uniqueDays = new Set(events.map((event) => formatDateKey(event.createdAt)));

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = formatDateKey(cursor);
    if (!uniqueDays.has(key)) break;

    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

export async function logProgressEvent(req, res) {
  try {
    const { eventType, durationMinutes = 0, language = "", metadata = {} } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: "eventType is required" });
    }

    const event = await ActivityEvent.create({
      user: req.user.id,
      eventType,
      durationMinutes,
      language,
      metadata,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error("Error in logProgressEvent:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getProgressDashboard(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setUTCDate(last7Days.getUTCDate() - 7);

    const [recentEvents, weeklyEvents] = await Promise.all([
      ActivityEvent.find({ user: userId }).sort({ createdAt: -1 }).limit(120),
      ActivityEvent.find({ user: userId, createdAt: { $gte: last7Days } }).sort({ createdAt: -1 }),
    ]);

    const minutesSpoken = weeklyEvents
      .filter((event) => ["call_completed", "practice_session_completed"].includes(event.eventType))
      .reduce((acc, event) => acc + (event.durationMinutes || 0), 0);

    const sessionsCompleted = weeklyEvents.filter((event) =>
      ["call_completed", "practice_session_completed"].includes(event.eventType)
    ).length;

    const languageSet = new Set(
      recentEvents.map((event) => (event.language || "").trim().toLowerCase()).filter(Boolean)
    );

    const streakDays = calculateStreak(recentEvents);

    const recentActivity = recentEvents.slice(0, 10).map((event) => ({
      id: event._id,
      eventType: event.eventType,
      durationMinutes: event.durationMinutes,
      language: event.language,
      createdAt: event.createdAt,
      metadata: event.metadata,
    }));

    res.status(200).json({
      metrics: {
        minutesSpoken,
        sessionsCompleted,
        languagesPracticed: languageSet.size,
        streakDays,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error in getProgressDashboard:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
