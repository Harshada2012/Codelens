import express from "express";
import cors from "cors";
import { prisma } from "./db/prisma";
import repositoryRoutes from "./routes/repository.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/repositories", repositoryRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Codelens API is running 🚀",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Codelens server running on http://localhost:${PORT}`);
});