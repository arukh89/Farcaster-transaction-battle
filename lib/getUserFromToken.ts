export async function getUserFromToken(token: string) {
  try {
    const res = await fetch('https://api.neynar.com/v2/farcaster/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error('Invalid token');
    }
    const data = await res.json();
    return data; // expect { fid, username, ... }
  } catch (err) {
    console.error('getUserFromToken error:', err);
    return null;
  }
}
