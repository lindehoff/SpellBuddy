import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "SpellBuddy - English Spelling Practice",
  description: "A fun and encouraging way to practice English spelling for students with dyslexia",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://unpkg.com/regenerator-runtime@0.13.11/runtime.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="relative min-h-screen">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-50 -z-10"></div>
              
              <NavBar />
              
              <main className="pt-20 sm:pt-20 md:pt-20 min-h-screen">
                {children}
              </main>
              
              <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
