import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { signInWithNeynar } from '../lib/neynarAuth';

interface Player {
  id: string;
  fid: string;
  displayName: string;
}

interface Message {
  id: string;
  fid: string;
  displayName: string;
  text: string;
  created_at?: string;
}

interface Leaderboard {
  id: string;
  fid: string;
  displayName: string;
  score: number;
  updated_at?: string;
}

interface Prediction {
  id: string;
  fid: string;
  displayName: string;
  block_height?: number;
  prediction: string;
  status: string;
  created_at?: string;
}

export default function Home() {
  const [user, setUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [predictionInput, setPredictionInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    if (!window.APP_NAME) window.APP_NAME = 'TX Battle Royale';
    // restore user from localStorage if present
    const stored = typeof window !== 'undefined' ? localStorage.getItem('neynar_user') : null;
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser({ id: u.fid, fid: u.fid, displayName: u.username || u.displayName || u.fid });
      } catch (err) {
        console.warn('Invalid stored user', err);
      }
    }

    // subscribe to players
    const pChannel = supabase
      .channel('players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchPlayers();
      })
      .subscribe();

    // messages
    const mChannel = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    // leaderboard
    const lChannel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    // predictions
    const rChannel = supabase
      .channel('predictions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, () => {
        fetchPredictions();
      })
      .subscribe();

    fetchPlayers();
    fetchMessages();
    fetchLeaderboard();
    fetchPredictions();

    setStatus('Ready. Connect Farcaster to join.');

    return () => {
      // unsubscribe channels on unmount
      try {
        supabase.removeChannel(pChannel);
        supabase.removeChannel(mChannel);
        supabase.removeChannel(lChannel);
        supabase.removeChannel(rChannel);
      } catch (err) { /* ignore */ }
    };
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*');
    if (data) setPlayers(data);
  }

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('* order by created_at desc').limit(200);
    if (data) setMessages(data.reverse());
  }

  async function fetchLeaderboard() {
    const { data } = await supabase.from('leaderboard').select('*').order('score', { ascending: false });
    if (data) setLeaderboard(data);
  }

  async function fetchPredictions() {
    const { data } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
    if (data) setPredictions(data);
  }

  async function connectFarcaster() {
    // start SIWN flow via Neynar
    signInWithNeynar();
  }

  // Called after Neynar redirects to /auth/callback which will save user in localStorage & cookie.
  async function joinGame() {
    if (!user) return alert('Connect Farcaster first.');
    await supabase.from('players').upsert({ fid: user.fid, displayName: user.displayName }).select();
    setStatus('Joined game.');
  }

  async function submitPrediction() {
    if (!user) return alert('Connect Farcaster first.');
    if (!predictionInput) return alert('Enter a prediction first.');

    const blockHeight = null; // optional: let admin evaluate with real block height
    await supabase.from('predictions').insert({
      fid: user.fid,
      displayName: user.displayName,
      block_height: blockHeight,
      prediction: predictionInput
    });
    setPredictionInput('');
    setStatus('Prediction submitted.');
  }

  async function sendMessage() {
    if (!user) return alert('Connect Farcaster first.');
    if (!chatInput) return;
    await supabase.from('messages').insert({
      fid: user.fid,
      displayName: user.displayName,
      text: chatInput
    });
    setChatInput('');
  }

  return (
    <>
      {/* SPLASH */}
      <div id="splashScreen" style={{ display: 'none' }}>
        <h1>🚀 TX Battle Royale</h1>
        <p className="subtitle">Loading... Please wait</p>
        <p id="status">{status}</p>
      </div>

      {/* GAME */}
      <div id="gameScreen">
        <div className="wrap">
          <header style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>TX Battle Royale</h1>
              <p className="subtitle">Predict & Compete on Bitcoin Blocks</p>
            </div>
            <button id="connectWalletBtn" onClick={connectFarcaster} className="wallet-btn">
              {user ? `Connected: ${user.displayName}` : 'Connect Farcaster'}
            </button>
          </header>

          <div className="card">
            <h2>Controls</h2>
            <div className="controls">
              <button id="joinBtn" onClick={joinGame} className="btn">Join Game</button>
              <button id="shareBtn" className="btn" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied'); }}>Share</button>
              <button id="prevBlockBtn" className="btn" onClick={() => alert('Prev block not implemented client-side')}>Prev Block</button>
              <button id="currBlockBtn" className="btn" onClick={() => alert('Curr block not implemented client-side')}>Curr Block</button>
            </div>

            <h3>Prediction</h3>
            <input type="text" id="predictionInput" value={predictionInput} onChange={(e) => setPredictionInput(e.target.value)} placeholder="Enter prediction..." />
            <button id="submitPredictionBtn" onClick={submitPrediction} className="btn">Submit</button>

            <h3>Players <span id="playerCount">({players.length})</span></h3>
            <ul id="playersContainer" className="players-list">
              {players.map((p) => (<li key={p.fid}>{p.displayName}</li>))}
            </ul>
          </div>

          <div>
            <div className="card">
              <h2>Chat</h2>
              <div id="messagesList" className="chat-list">
                {messages.map((m) => (<div key={m.id} className="chat-item"><strong>{m.displayName}:</strong> <span>{m.text}</span></div>))}
              </div>
              <form id="chatForm" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <input id="chatInput" name="chat" type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." />
              </form>
            </div>

            <div className="card">
              <h2>Leaderboard</h2>
              <ul id="leaderboardContainer" className="leaderboard-list">
                {leaderboard.map((l) => (<li key={l.id}>{l.displayName} — {l.score}</li>))}
              </ul>
            </div>

            <div className="card">
              <h2>Predictions</h2>
              <ul>
                {predictions.map((p) => (
                  <li key={p.id}>
                    {p.displayName} predicted <b>{p.prediction}</b> @ {p.block_height || '—'} → {' '}
                    {p.status === 'pending' && <span style={{ color: 'orange' }}>⏳ pending</span>}
                    {p.status === 'correct' && <span style={{ color: 'green' }}>✅ correct</span>}
                    {p.status === 'wrong' && <span style={{ color: 'red' }}>❌ wrong</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p>TX Battle Royale © 2025 - Powered by Farcaster Mini App</p>
          </footer>
        </div>
      </div>
    </>
  );
}
