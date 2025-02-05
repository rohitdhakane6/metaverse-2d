import express from "express";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { PORT } from "./config";
import routes from "./routes/v1";



const app = express();

app
  .disable("x-powered-by")              // Security measure to hide Express from responses
  .use(morgan("dev"))                   // Request logging middleware
  .use(urlencoded({ extended: true }))  // Parse URL-encoded data
  .use(json())                          // Parse JSON data
  .use(cors());                         // Enable CORS for all routes

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});



app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
