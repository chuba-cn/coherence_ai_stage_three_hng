import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import Head from "next/head";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Coherence AI",
  description: "AI Powered text processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        {process.env.NEXT_PUBLIC_SUMMARIZER_ORIGIN_TRIAL && (
          <meta
            httpEquiv="origin-trial"
            content={process.env.NEXT_PUBLIC_SUMMARIZER_ORIGIN_TRIAL}
          />
        )}
        {process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_ORIGIN_TRIAL && (
          <meta
            httpEquiv="origin-trial"
            content={process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_ORIGIN_TRIAL}
          />
        )}
        {process.env.NEXT_PUBLIC_TRANSLATOR_ORIGIN_TRIAL && (
          <meta
            httpEquiv="origin-trial"
            content={process.env.NEXT_PUBLIC_TRANSLATOR_ORIGIN_TRIAL}
          />
        )}
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans min-h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500`}
      >
        <div className="relative text-dark dark:text-white">
          <div className="absolute right-4 top-4 z-50 rounded-full"></div>
          {children}
          <Toaster richColors />
        </div>
      </body>
    </html>
  );
}
