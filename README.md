# TX Battle Royale — Farcaster Mini App (Next.js + Supabase + Neynar)

This repository contains a complete frontend Next.js app integrated with Supabase (Realtime DB)
and Neynar (Sign-In With Neynar) for Farcaster identity. It implements the TX Battle Royale UI
(derived from your App.tsx) with real shared state: players, chat, predictions, leaderboard.

## Features
- Next.js frontend (pages + API)
- Supabase integration (players, messages, predictions, leaderboard)
- Neynar SIWN OAuth flow (client-side redirect + callback)
- Admin panel (/admin) protected server-side to trigger manual evaluation
- `/api/evaluate` API uses mempool.space to evaluate predictions and update leaderboard
- No Socket.IO; Supabase Realtime handles live updates

## Quick start (local)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` → `.env.local` and fill in values (Supabase keys, Neynar client id, ADMIN_FID)
3. Create tables in Supabase (see `supabase_schema.sql`) or run SQL in Supabase SQL editor.
4. Run dev:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Notes
- For server-side Supabase operations (in `/api/evaluate`) we use `SUPABASE_SERVICE_ROLE_KEY`.
  Do **not** expose this key in client-side code or commit it into source control.
- Neynar tokens are stored in cookie `neynar_token` and localStorage `neynar_user` during login.
- This repo is intended as a complete starting point — replace env values and secure keys before production.

