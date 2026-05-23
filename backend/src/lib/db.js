import mongoose from "mongoose";

const redactMongoUri = (text = "") => {
  const value = String(text);
  // Hide credentials in mongodb://user:pass@host
  const maskedCredentials = value.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s]+)@/gi, "$1***@");
  // Hide full URI if it appears anywhere in logs
  return process.env.MONGO_URI
    ? maskedCredentials.replaceAll(process.env.MONGO_URI, "[REDACTED_MONGO_URI]")
    : maskedCredentials;
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    const safeMessage = redactMongoUri(error?.message || "Unknown connection error");
    console.error("Error in connecting to MongoDB:", safeMessage);
    // Do not exit the process here; allow the host (Render) to manage restarts
    // and keep the server process alive for observability. The server will
    // operate in degraded mode until the DB is available.
    return;
  }
};