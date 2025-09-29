// pages/_app.tsx
import '../public/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

function tryCallSdkReady(): boolean {
  const w = window as any;
  if (w?.sdk && w.sdk.actions && typeof w.sdk.actions.ready === 'function') {
    try {
      w.sdk.actions.ready();
      // optional: console.log('Farcaster SDK: ready() called');
    } catch (e) {
      console.warn('Farcaster sdk.actions.ready() failed:', e);
    }
    return true;
  }
  return false;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // jika sdk sudah ada, panggil segera
    if (tryCallSdkReady()) return;

    // polling ringkas sampai SDK dimuat (mis. via CDN)
    const interval = window.setInterval(() => {
      if (tryCallSdkReady()) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>TX Battle Royale — Farcaster Mini App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
