# SpellBuddy Achievement System

This document provides an overview of the SpellBuddy achievement system, including its architecture, available achievements, and how to extend it.

## Overview

The achievement system is designed to gamify the learning experience by rewarding users for their progress and engagement with the application. Achievements are automatically unlocked as users meet specific criteria during their learning journey.

## Architecture

The achievement system consists of the following components:

### Database Schema

- **Achievement**: Stores the definition of each achievement
  - `id`: Unique identifier
  - `type`: Category of achievement (e.g., streak, exercise_count)
  - `name`: Display name of the achievement
  - `description`: Detailed description of what the achievement represents
  - `icon`: Icon to display for the achievement
  - `requiredValue`: Numeric value required to unlock the achievement
  - `createdAt`: When the achievement was created

- **UnlockedAchievement**: Tracks which achievements have been unlocked by users
  - `id`: Unique identifier
  - `userId`: User who unlocked the achievement
  - `achievementId`: Reference to the achievement that was unlocked
  - `unlockedAt`: When the achievement was unlocked

### API Endpoints

- `GET /api/achievements`: Returns all achievements with their unlocked status for the current user
- `POST /api/achievements/unlock`: (Internal) Endpoint used to unlock achievements

### Components

- `src/app/achievements/page.tsx`: The achievements page that displays all achievements
- `src/components/AchievementCard.tsx`: Component for displaying individual achievements
- `src/lib/db/seed/achievements.ts`: Contains the definitions of all achievements and seeding logic

## Available Achievement Types

The system currently supports the following achievement types:

1. **streak**: Rewards consistent daily practice
   - Levels: 3, 7, 14, 30, 60, 100 days

2. **exercise_count**: Rewards completing a number of exercises
   - Levels: 5, 25, 100, 500, 1000 exercises

3. **perfect_exercise**: Rewards completing exercises with no mistakes
   - Levels: 3, 10, 25, 50, 100 perfect exercises

4. **word_count**: Rewards learning a number of words
   - Levels: 50, 200, 500, 1000, 2000 words

5. **level**: Rewards reaching specific levels
   - Levels: 5, 10, 25, 50, 75, 100

6. **challenge**: Rewards completing challenges
   - Levels: 1, 5, 10, 25, 50 challenges

7. **accuracy**: Rewards achieving specific accuracy percentages
   - Levels: 70%, 80%, 90%, 95%, 100% accuracy

8. **time**: Rewards completing exercises quickly
   - Levels: Under 2 minutes, under 1 minute, under 30 seconds

9. **difficulty**: Rewards completing exercises at different difficulty levels
   - Levels: Beginner, Intermediate, Advanced, Expert

## Unlocking Logic

Achievements are automatically unlocked when users meet the criteria. The unlocking logic is implemented in various parts of the application:

- After completing exercises
- When reaching specific milestones
- During daily login checks

## Testing the Achievement System

You can test the achievement system using the provided script:

```bash
# Test the achievement system
npm run test-achievements

# Test and unlock random achievements for testing
npm run test-achievements -- --unlock-random
```

This script will:
1. Count the number of achievements in the database
2. List achievement types and their counts
3. Test the API endpoint to ensure it returns all achievements
4. Optionally unlock random achievements for testing purposes

## Extending the Achievement System

### Adding New Achievement Types

To add a new achievement type:

1. Update the `src/lib/db/seed/achievements.ts` file to include the new achievement type and its levels
2. Add the appropriate icon in the `public/icons/achievements` directory
3. Update the unlocking logic in the relevant parts of the application

### Adding New Achievement Levels

To add new levels to existing achievement types:

1. Update the `src/lib/db/seed/achievements.ts` file to include the new levels
2. Run the database seed command to add the new achievements:
   ```bash
   npx prisma db seed
   ```

## Troubleshooting

### No Achievements Displayed

If no achievements are displayed on the achievements page:

1. Check if the database contains achievements:
   ```bash
   npm run test-achievements
   ```

2. If no achievements are found, seed the database:
   ```bash
   npx prisma db seed
   ```

3. Verify the API is returning achievements:
   ```bash
   curl http://localhost:3000/api/achievements | jq
   ```

### Achievement Not Unlocking

If an achievement is not unlocking when expected:

1. Check the unlocking logic for that achievement type
2. Verify the user's progress meets the required criteria
3. Check the server logs for any errors during the unlocking process

## Future Enhancements

Planned enhancements for the achievement system include:

1. **Achievement Notifications**: Real-time notifications when achievements are unlocked
2. **Achievement Badges**: Displayable badges on user profiles
3. **Achievement Leaderboard**: Compare achievement progress with other users
4. **Custom Achievement Paths**: Allow users to set personal achievement goals 