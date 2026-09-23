import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email, name } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Failed to create user:", error);

    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

export default router;
