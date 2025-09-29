import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const resp = await fetch("https://api.neynar.com/v2/farcaster/app", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY!, // simpan di .env
      },
      body: JSON.stringify({
        url: process.env.NEXT_PUBLIC_APP_URL,
        name: process.env.NEXT_PUBLIC_APP_NAME,
      }),
    });

    const data = await resp.json();
    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
