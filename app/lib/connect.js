import mongoose from "mongoose";

const mongourl = process.env.mongourl;

const connectdb = async () => {
  try {
    await mongoose.connect(mongourl);

    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error:", err);
    });

  } catch (err) {
    console.error("Initial MongoDB connection error:", err);
  }
};

export default connectdb;
