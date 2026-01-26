"use client";

import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Prism — Interview Prep</title>
        <meta name="description" content="Prism: practice interviews, generate questions and evaluate responses." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
