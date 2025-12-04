import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import tasksRouter from "./routes/tasks.js";
import parseRouter from "./routes/parse.js";
import speechRouter from "./routes/speech.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tasks", tasksRouter);
app.use("/api/parse", parseRouter);
app.use("/api/speech-to-text", speechRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


