
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
import mongoose from 'mongoose'
const mongoUrl = process.env.MONGO_URL;
console.log(mongoUrl)
export const connectMongo = async (): Promise<void> => {
  if (mongoUrl) {
    try {
      await mongoose.connect(mongoUrl);
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("Connection error:", error);
      process.exit(1); 
    }
  }
};



