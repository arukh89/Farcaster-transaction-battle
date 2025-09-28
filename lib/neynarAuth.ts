export function signInWithNeynar() {
  const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID as string;
  if (!clientId) {
    alert('NEYNAR client id not configured in NEXT_PUBLIC_NEYNAR_CLIENT_ID');
    return;
  }
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope = 'openid profile';
  const url = `https://app.neynar.com/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  // Redirect user to Neynar SIWN (OAuth)
  window.location.href = url;
}
