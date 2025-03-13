import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpellBuddy - English Spelling Practice",
  description: "A fun and encouraging way to practice English spelling for students with dyslexia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://unpkg.com/regenerator-runtime@0.13.11/runtime.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-700">
              SpellBuddy
            </Link>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="/practice" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Practice
              </Link>
              <Link href="/progress" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Progress
              </Link>
              <Link href="/about" className="text-indigo-600 hover:text-indigo-800 font-medium">
                About
              </Link>
            </div>
          </nav>
        </header>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
          {children}
        </main>
      </body>
    </html>
  );
}
