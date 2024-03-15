import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
// import ReactGA from "react-ga4";

import "../src/index.css";
import "./globals.css";
import "../src/styles/App.css";
import "../src/styles/FlexContainers.css";
import "../src/styles/Colors.css";
import "../src/styles/Components.css";
import "../src/styles/Text.css";
import "../src/styles/Notifications.css";

import Head from "next/head";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID);

export default function MyApp({ Component, pageProps }, props) {
  const cookies = useCookies();

  const [user, setUser] = useState(null);

  const [lastUserCheck, setLastUserCheck] = useState(null);

  useEffect(() => {
    // Set the body div to have data-theme=light
    document.body.setAttribute("data-theme", "light");
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta charset="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />

        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

        <title data-react-helmet="true">Mystic Chat</title>
        <meta name="description" content="Mystic Chat is an open source multimodal chat." data-react-helmet="true" />

        <meta property="og:description" content="Mystic Chat is an open source multimodal chat" data-react-helmet="true" />
        <meta property="og:title" content="Mystic Chat" data-react-helmet="true" />
        <meta property="og:type" content="website" data-react-helmet="true" />
        <meta property="og:url" content="https://chat.mystic.ai/" data-react-helmet="true" />
        <meta property="og:image" content="https://chat.mystic.ai/assets/social/social-card.png" data-react-helmet="true" />
        <meta name="twitter:title" content="Mystic Chat" data-react-helmet="true" />
        <meta name="twitter:description" content="Mystic Chat is an open source multimodal chat." data-react-helmet="true" />
        <meta name="twitter:image" content="https://chat.mystic.ai/assets/social/social-card.png" data-react-helmet="true" />
        <meta name="twitter:card" content="summary_large_image" data-react-helmet="true" />
      </Head>
      <main
        className={inter.className}
        style={{
          flex: "1 1 auto",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Component {...pageProps} />
      </main>
    </React.Fragment>
  );
}
