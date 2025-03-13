"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-3xl bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-5xl font-bold text-indigo-700 mb-6">
          Welcome to SpellBuddy!
        </h1>
        
        <p className="text-xl text-gray-800 mb-8 font-medium">
          SpellBuddy is a fun and encouraging way to practice English spelling.
          Translate Swedish texts, speak your answers, and improve your spelling skills!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/practice" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
          >
            Start Practicing
          </Link>
          
          <Link 
            href="/progress" 
            className="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-3 px-6 rounded-lg text-lg border border-indigo-300 transition-colors duration-200"
          >
            View Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
