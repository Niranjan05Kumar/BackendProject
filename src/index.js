import express from "express";
const app = express();
import connectDB from "./db/index.js";

connectDB();


app.listen(process.env.PORT)