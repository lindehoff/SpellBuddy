"use client";

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-4xl font-bold text-indigo-700 mb-6 text-center">About SpellBuddy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-3">What is SpellBuddy?</h2>
          <p className="text-gray-800 mb-4">
            SpellBuddy is a personalized spelling practice tool designed to help English learners improve their spelling skills. 
            It focuses particularly on supporting individuals with dyslexia by providing multiple ways to engage with words and spelling.
          </p>
          <p className="text-gray-800">
            The application offers a friendly, encouraging environment where users can practice translating Swedish texts to English, 
            use speech recognition to check pronunciation, and receive immediate feedback on their progress.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-3">Key Features</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-2">
            <li>Translation practice from Swedish to English</li>
            <li>Speech recognition for verbal spelling practice</li>
            <li>Written practice mode for traditional spelling exercises</li>
            <li>Progress tracking to monitor improvement over time</li>
            <li>Personalized feedback on strengths and areas for improvement</li>
            <li>Adaptive difficulty based on user performance</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-3">How It Helps With Dyslexia</h2>
          <p className="text-gray-800 mb-4">
            SpellBuddy was created with dyslexic learners in mind, incorporating features that address common challenges:
          </p>
          <ul className="list-disc pl-6 text-gray-800 space-y-2">
            <li>Multiple modes of practice (visual, auditory, written)</li>
            <li>Clear, high-contrast interface for improved readability</li>
            <li>Immediate feedback to reinforce correct spelling</li>
            <li>Focus on frequently misspelled words</li>
            <li>Positive reinforcement to build confidence</li>
          </ul>
        </section>
        
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 