import react from "react";
import mongoose from "mongoose";
const mongourl=process.env.mongourl;
const connectdb=async()=>{
mongoose.connect(mongourl);
mongoose.connection.on("connected",()=>{
    console.log("successfully connected to mongo ")

})
};
export default connectdb;
