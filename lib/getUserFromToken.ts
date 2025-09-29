import jwt from "jsonwebtoken";

/**
 * Decode user dari Neynar token
 */
export async function getUserFromToken(token: string) {
  try {
    // Neynar token = JWT tanpa verifikasi private key (cukup decode saja)
    const payload = jwt.decode(token) as any;

    if (!payload) return null;

    return {
      fid: payload.fid,
      username: payload.username || null,
      displayName: payload.username || `FID ${payload.fid}`,
    };
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
    return null;
  }
}
