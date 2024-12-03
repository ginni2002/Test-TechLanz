import mongoose from "mongoose";
import { config } from "../config/config";

export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
