# SpellBuddy

SpellBuddy is a web application designed to help students with dyslexia practice English spelling in a fun and encouraging way. The application uses AI to generate personalized exercises, evaluate spelling, and provide helpful tips for improvement.

## Features

- **Personalized Exercises**: Generates Swedish texts for translation that include words the student has struggled with in the past
- **Speech Recognition**: Allows students to speak their translations before writing them
- **Spelling Evaluation**: AI-powered evaluation of spelling with personalized tips for improvement
- **Word Practice**: Focused practice on misspelled words until they are mastered
- **Progress Tracking**: Tracks progress over time and provides encouraging feedback
- **User Accounts**: Personalized experience with user-specific exercises and progress tracking
- **Preferences**: Customize exercises based on age, interests, and difficulty level

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
3. Create a `.env.local` file in the root directory with your environment variables:
   ```
   # Authentication
   JWT_SECRET=your_jwt_secret_key_here

   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini

   # Database
   DATABASE_URL=file:./spellbuddy.db
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

1. Create an account or log in to access personalized exercises
2. Set your preferences (age, interests, difficulty level)
3. The student is presented with a short Swedish text to translate
4. They first speak their translation (using speech recognition)
5. Then they write their translation
6. The AI evaluates their spelling and provides feedback
7. For any misspelled words, the student practices them until they get them right
8. Progress is tracked and used to generate personalized exercises

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- SQLite with Drizzle ORM
- React Speech Recognition
- JWT Authentication

## License

This project is licensed under the MIT License.
