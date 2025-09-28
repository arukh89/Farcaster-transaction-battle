import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

type ResponseData = {
  success: boolean;
  message: string;
  updated?: number;
  errors?: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // 1. Ambil prediksi pending
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('status', 'pending');

    if (error) throw error;
    if (!predictions || predictions.length === 0) {
      return res.json({ success: true, message: 'No pending predictions found.' });
    }

    // 2. Ambil block terbaru dari mempool.space
    const blockRes = await fetch('https://mempool.space/api/blocks');
    if (!blockRes.ok) throw new Error('Failed to fetch mempool.space blocks');
    const blocks = await blockRes.json();

    // Ambil block paling baru
    const latestBlock = blocks[0];
    const latestHeight = latestBlock.height;

    let updatedCount = 0;
    let errors: string[] = [];

    // 3. Evaluasi prediksi
    for (const p of predictions) {
      // misalnya prediksi user berupa angka block_height
      let status = 'wrong';
      if (p.block_height && Number(p.block_height) === Number(latestHeight)) {
        status = 'correct';
      }

      const { error: updateError } = await supabase
        .from('predictions')
        .update({ status })
        .eq('id', p.id);

      if (updateError) {
        errors.push(`Prediction ${p.id}: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    return res.json({
      success: true,
      message: `Evaluation done. ${updatedCount} predictions checked against block ${latestHeight}.`,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
}
