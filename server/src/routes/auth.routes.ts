import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/github", (_req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "GitHub Client ID is not configured",
    });
  }

  const githubUrl = new URL("https://github.com/login/oauth/authorize");

  githubUrl.searchParams.set("client_id", clientId);
  githubUrl.searchParams.set(
    "redirect_uri",
    process.env.GITHUB_CALLBACK_URL || "",
  );
  githubUrl.searchParams.set("scope", "read:user user:email repo");

  res.redirect(githubUrl.toString());
});

router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (typeof code !== "string") {
      return res.status(400).json({
        error: "Authorization code is missing",
      });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        error: "Failed to get GitHub access token",
      });
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Codelens",
      },
    });

    const githubUser = await userResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Codelens",
      },
    });

    const githubEmails = await emailResponse.json();

    const primaryEmail = githubEmails.find(
      (email: { primary: boolean; verified: boolean }) =>
        email.primary && email.verified,
    );

    const user = await prisma.user.upsert({
      where: {
        githubId: String(githubUser.id),
      },
      update: {
        githubUsername: githubUser.login,
        name: githubUser.name,
        email: primaryEmail?.email,
      },
      create: {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        name: githubUser.name,
        email: primaryEmail?.email,
      },
    });

    res.json({
      message: "GitHub authentication successful",
      user: {
        id: user.id,
        email: user.email,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
      },
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);

    res.status(500).json({
      error: "GitHub authentication failed",
    });
  }
});

export default router;