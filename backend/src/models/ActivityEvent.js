import mongoose from "mongoose";

const activityEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    language: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

activityEventSchema.index({ user: 1, createdAt: -1 });

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);

export default ActivityEvent;
