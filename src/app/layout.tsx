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
      <body className={`${inter.className} bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50`}>
        <AuthProvider>
          <NavBar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
          <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-indigo-100/50 to-transparent pointer-events-none"></div>
        </AuthProvider>
      </body>
    </html>
  );
}
