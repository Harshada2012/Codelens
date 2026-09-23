import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

// Get all repositories
router.get("/", async (_req, res) => {
  try {
    const repositories = await prisma.repository.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(repositories);
  } catch (error) {
    console.error("Failed to fetch repositories:", error);

    res.status(500).json({
      error: "Failed to fetch repositories",
    });
  }
});

// Create a repository
router.post("/", async (req, res) => {
  try {
    const {
      githubId,
      name,
      fullName,
      url,
      description,
      ownerId,
    } = req.body;

    const repository = await prisma.repository.create({
      data: {
        githubId,
        name,
        fullName,
        url,
        description,
        ownerId,
      },
    });

    res.status(201).json(repository);
  } catch (error) {
    console.error("Failed to create repository:", error);

    res.status(500).json({
      error: "Failed to create repository",
    });
  }
});

export default router;