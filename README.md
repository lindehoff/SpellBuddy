# SpellBuddy

SpellBuddy is a web application designed to help students with dyslexia practice English spelling in a fun and encouraging way. The application uses AI to generate personalized exercises, evaluate spelling, and provide helpful tips for improvement.

## Features

- **Personalized Exercises**: Generates Swedish texts for translation that include words the student has struggled with in the past
- **Speech Recognition**: Allows students to speak their translations before writing them
- **Spelling Evaluation**: AI-powered evaluation of spelling with personalized tips for improvement
- **Word Practice**: Focused practice on misspelled words until they are mastered
- **Progress Tracking**: Tracks progress over time and provides encouraging feedback

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```
4. Generate the database schema:
   ```
   npm run db:generate
   ```
5. Run database migrations:
   ```
   npm run db:migrate
   ```

### Running the Application

Start the development server:
```
npm run dev
```

The application will be available at http://localhost:3000

## How It Works

1. The student is presented with a short Swedish text to translate
2. They first speak their translation (using speech recognition)
3. Then they write their translation
4. The AI evaluates their spelling and provides feedback
5. For any misspelled words, the student practices them until they get them right
6. Progress is tracked and used to generate personalized exercises

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- SQLite with Drizzle ORM
- React Speech Recognition

## License

This project is licensed under the MIT License.
