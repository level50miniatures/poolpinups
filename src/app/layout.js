import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Pinup Forge — Forge the Next Heroine",
  description: "Backers of the realm summon the next fantasy pinup, vote by vote.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Marcellus&family=UnifrakturCook:wght@700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <Script src="/image-slot.js" strategy="lazyOnload" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
