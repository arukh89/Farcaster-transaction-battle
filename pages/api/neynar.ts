// pages/api/neynar.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { endpoint, body } = req.body;

    const response = await fetch(`https://api.neynar.com/v2/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY!, // 🚨 hanya server-side
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Neynar API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
