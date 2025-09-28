import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { setCookie } from 'cookies-next';

export default function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
      // fetch user profile from Neynar
      fetch('https://api.neynar.com/v2/farcaster/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then(async (data) => {
          // save to localStorage for client checks
          localStorage.setItem('neynar_token', token);
          localStorage.setItem('neynar_user', JSON.stringify(data));
          // set cookie for server-side checks
          setCookie('neynar_token', token, { maxAge: 60 * 60 * 24 });
          // Upsert player to Supabase
          try {
            await supabase.from('players').upsert({ fid: data.fid, displayName: data.username || data.displayName || data.fid }).select();
          } catch (err) {
            console.error('Supabase upsert error', err);
          }
          // redirect to homepage
          window.location.href = '/';
        })
        .catch((err) => {
          console.error('Failed to fetch Neynar user', err);
          alert('Login failed');
          window.location.href = '/';
        });
    } else {
      alert('No token received from Neynar');
      window.location.href = '/';
    }
  }, []);

  return <p>Processing login...</p>;
}
