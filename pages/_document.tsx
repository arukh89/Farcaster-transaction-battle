// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Mini App SDK via CDN (dipasang di Document agar selalu tersedia) */}
        <script
          src="https://cdn.jsdelivr.net/npm/@farcaster/mini-apps-sdk/dist/browser.js"
          async
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
