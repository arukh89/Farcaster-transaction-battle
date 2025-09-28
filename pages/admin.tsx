import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { getUserFromToken } from '../lib/getUserFromToken';

interface AdminProps {
  authorized: boolean;
  user?: any;
}

export default function AdminPanel({ authorized, user }: AdminProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function evaluateNow() {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Evaluation failed!');
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div style={{ padding: 20 }}>
        <h1>❌ Access Denied</h1>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>⚡ TX Battle Royale Admin Panel</h1>
      <p>Welcome, {user?.username || user?.fid}</p>

      <button
        onClick={evaluateNow}
        disabled={loading}
        style={{ padding: '10px 16px', borderRadius: 8 }}
      >
        {loading ? 'Evaluating...' : '🚀 Evaluate Now'}
      </button>

      {result && (
        <pre
          style={{
            background: '#111',
            color: '#0f0',
            padding: 12,
            marginTop: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const adminFid = "250704"; // Hardcode FID kamu (@ukhy89)
  const token = ctx.req.cookies['neynar_token'];

  if (!token) {
    return { props: { authorized: false } };
  }

  const user = await getUserFromToken(token);
  if (!user || String(user.fid) !== adminFid) {
    return { props: { authorized: false } };
  }

  return { props: { authorized: true, user } };
};
