import { json, urlencoded } from "body-parser";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3001;
const app = express();
app
  .disable("x-powered-by")
  .use(morgan("dev"))
  .use(urlencoded({ extended: true }))
  .use(json())
  .use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ ok: true });
});
app.listen(port, () => {
  console.log(`api running on ${port}`);
});
