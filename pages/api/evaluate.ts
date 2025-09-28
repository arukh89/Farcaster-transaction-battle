import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Set it in environment.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function getLatestBlock() {
  const resp = await fetch('https://mempool.space/api/blocks');
  if (!resp.ok) throw new Error('Failed to fetch blocks from mempool.space');
  const blocks = await resp.json();
  return blocks[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get pending predictions
    const { data: predictions } = await supabaseAdmin.from('predictions').select('*').eq('status', 'pending');
    if (!predictions || predictions.length === 0) {
      return res.json({ message: 'No pending predictions' });
    }

    const block = await getLatestBlock();
    const actualValue = String(block.tx_count); // using tx_count as the evaluated metric

    for (const p of predictions) {
      const isCorrect = p.prediction === actualValue;
      await supabaseAdmin.from('predictions').update({ status: isCorrect ? 'correct' : 'wrong' }).eq('id', p.id);

      if (isCorrect) {
        const { data: entry } = await supabaseAdmin.from('leaderboard').select('*').eq('fid', p.fid).maybeSingle();
        if (entry) {
          await supabaseAdmin.from('leaderboard').update({ score: entry.score + 10, updated_at: new Date().toISOString() }).eq('fid', p.fid);
        } else {
          await supabaseAdmin.from('leaderboard').insert({ fid: p.fid, displayName: p.displayName, score: 10 });
        }
      }
    }

    return res.json({ success: true, evaluated: predictions.length, block, actualValue });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
