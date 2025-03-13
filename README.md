# 🧙‍♂️ SpellBuddy

SpellBuddy is a modern web application designed to help students with dyslexia practice English spelling in a fun and encouraging way. The application uses AI to generate personalized exercises, evaluate spelling, and provide helpful tips for improvement.

![SpellBuddy Screenshot](https://via.placeholder.com/800x450.png?text=SpellBuddy+Screenshot)

## ✨ Features

- **Personalized Exercises**: Generates Swedish texts for translation that include words the student has struggled with in the past
- **Speech Recognition**: Allows students to speak their translations before writing them
- **Spelling Evaluation**: AI-powered evaluation of spelling with personalized tips for improvement
- **Word Practice**: Focused practice on misspelled words until they are mastered
- **Progress Tracking**: Tracks progress over time and provides encouraging feedback
- **User Accounts**: Personalized experience with user-specific exercises and progress tracking
- **Preferences**: Customize exercises based on age, interests, and difficulty level
- **Gamification**: Level up system, achievements, and streaks to keep students motivated
- **Modern Design**: Beautiful glass morphism UI with dark mode support
- **Responsive**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/spellbuddy.git
   cd spellbuddy
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your environment variables
   ```
   # Authentication
   JWT_SECRET=your_jwt_secret_key_here

   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini

   # Database
   DATABASE_URL=file:./spellbuddy.db
   ```

4. Generate the database schema
   ```bash
   npm run db:generate
   ```

5. Run database migrations
   ```bash
   npm run db:migrate
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🐳 Docker Deployment

### Using Docker with Persistent Data

Run the container with a volume to persist the database:

```shell
# Create a directory for persistent data
mkdir -p ~/spellbuddy-data

# Run the container with a mounted volume
docker run -d -p 3000:3000 \
  -v ~/spellbuddy-data:/app/data \
  -e JWT_SECRET=your_jwt_secret \
  -e OPENAI_API_KEY=your_openai_api_key \
  -e OPENAI_MODEL=gpt-4o-mini \
  yourusername/spellbuddy:latest
```

The database will be automatically created if it doesn't exist, and migrations will be run on container startup.

### Running Database Migrations Manually

If you need to run database migrations manually (for example, after updating the application):

```shell
# Get the container ID
CONTAINER_ID=$(docker ps -q -f "ancestor=yourusername/spellbuddy:latest")

# Run migrations
docker exec $CONTAINER_ID npm run db:migrate
```

### Cross-Platform Development

If you're developing on an ARM-based Mac (M1/M2/M3) but deploying to an AMD64 server, make sure to use the amd64 version of the image:

```shell
# Pull the amd64 version explicitly
docker pull --platform linux/amd64 yourusername/spellbuddy:latest

# Run with platform specified
docker run --platform linux/amd64 -d -p 3000:3000 \
  -v ~/spellbuddy-data:/app/data \
  -e JWT_SECRET=your_jwt_secret \
  -e OPENAI_API_KEY=your_openai_api_key \
  -e OPENAI_MODEL=gpt-4o-mini \
  yourusername/spellbuddy:latest
```

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

1. **Build**: Builds and tests the application on every push and pull request
2. **Docker**: Creates a Docker image and pushes it to Docker Hub on every push to the main branch
3. **Versioning**: Creates tagged Docker images for every Git tag with the format `v*`

To use the CI/CD pipeline, set the following secrets in your GitHub repository:
- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_TOKEN`: Your Docker Hub access token

## 📱 How It Works

1. Create an account or log in to access personalized exercises
2. Set your preferences (age, interests, difficulty level)
3. The student is presented with a short Swedish text to translate
4. They first speak their translation (using speech recognition)
5. Then they write their translation
6. The AI evaluates their spelling and provides feedback
7. For any misspelled words, the student practices them until they get them right
8. Progress is tracked and used to generate personalized exercises
9. Achievements are unlocked as the student progresses
10. The student can view their progress and achievements on the progress page

## 🛠️ Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQLite with Drizzle ORM
- **AI**: OpenAI API for exercise generation and spelling evaluation
- **Speech**: React Speech Recognition
- **Authentication**: JWT
- **Deployment**: Docker, GitHub Actions
- **Design**: Glass morphism, CSS animations, responsive design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenAI for providing the AI capabilities
- Next.js team for the amazing framework
- All contributors who have helped improve this project
