import { useEffect } from "react";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // ambil token dari URL
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        if (!token) {
          alert("❌ Token not found in callback URL");
          return;
        }

        // simpan token ke cookie (buat server-side)
        setCookie("neynar_token", token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 hari
        });

        // decode payload token (opsional, untuk ambil user)
        const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
        const user = {
          fid: payload.fid,
          username: payload.username,
        };

        // simpan user ke localStorage (buat client-side)
        localStorage.setItem("neynar_user", JSON.stringify(user));

        // upsert player ke Supabase
        if (user.fid) {
          await supabase.from("players").upsert({
            fid: String(user.fid),
            displayName: user.username || `FID ${user.fid}`,
          });
        }

        // redirect ke home
        router.push("/");
      } catch (err) {
        console.error("Auth callback error:", err);
        alert("Authentication failed. Check console.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h1>⏳ Authenticating with Farcaster...</h1>
      <p>Please wait, redirecting...</p>
    </div>
  );
}
