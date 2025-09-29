// pages/api/registerMiniApp.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.neynar.com/v2/farcaster/mini-apps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY!, // <- pakai .env
      },
      body: JSON.stringify({
        url: "https://farcaster-transaction-battle.vercel.app/.well-known/farcaster.json",
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Error registering mini-app:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
