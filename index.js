import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";


import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";
import postRoute from "./routes/post.js";

const app = express();
dotenv.config();


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log("connected to MongoDB")
});


// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);




app.listen(8800, () => {
    console.log("Backend server listen port:8800");
})