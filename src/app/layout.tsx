import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";

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
        <AuthProvider>
          <NavBar />
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
