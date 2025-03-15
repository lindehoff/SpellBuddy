# SpellBuddy Achievement System

SpellBuddy includes a comprehensive achievement system to gamify the learning experience and motivate users to continue practicing.

## Achievement Types

The system includes 44 achievements across 8 categories:

1. **Streak Achievements (6)**: Reward consistent daily practice
   - 3, 7, 14, 30, 60, and 100 day streaks

2. **Exercise Count Achievements (5)**: Reward completing exercises
   - 5, 25, 100, 500, and 1000 exercises

3. **Perfect Exercise Achievements (5)**: Reward exercises with no mistakes
   - 3, 10, 25, 50, and 100 perfect exercises

4. **Word Count Achievements (5)**: Reward practicing a large number of words
   - 50, 200, 500, 1000, and 2000 words

5. **Level Achievements (6)**: Reward reaching higher levels
   - Levels 5, 10, 25, 50, 75, and 100

6. **Challenge Achievements (5)**: Reward completing challenges
   - 1, 5, 10, 25, and 50 challenges

7. **Accuracy Achievements (5)**: Reward high accuracy rates
   - 70%, 80%, 90%, 95%, and 100% accuracy

8. **Time-based Achievements (3)**: Reward completing exercises quickly
   - Under 2 minutes, under 1 minute, and under 30 seconds

9. **Difficulty-based Achievements (4)**: Reward tackling harder content
   - Beginner, intermediate, advanced, and expert difficulty levels

## How Achievements Work

- Achievements are automatically seeded in the database when it's first created
- Achievements unlock automatically as users meet the requirements
- All achievements are visible on the achievements page, with unlocked ones highlighted
- Unlocked achievements show the date they were achieved

## Troubleshooting

If achievements are not appearing in the application, you can:

1. **Check the database**: Run `sqlite3 sqlite.db "SELECT COUNT(*) FROM achievements;"` to verify achievements exist

2. **Force seed achievements**: If no achievements are found, run:
   ```
   npm run db:seed-achievements
   ```
   This script will:
   - Clear the existing achievements table
   - Re-seed all 44 achievements
   - Verify the seeding was successful

3. **Check the API**: Use the following command to check if the API is returning achievements:
   ```
   curl http://localhost:3000/api/achievements | jq
   ```

4. **Restart the application**: Sometimes a simple restart can resolve issues:
   ```
   npm run dev
   ```

## Adding New Achievements

To add new achievements:

1. Update the seed file at `src/lib/db/seed/achievements.ts`
2. Run the force seed script: `npm run db:seed-achievements`

## Achievement System Architecture

- **Database Schema**: Achievements are stored in the `achievements` table
- **API Endpoint**: `/api/achievements` returns all achievements with unlocked status
- **UI Component**: The achievements page displays all achievements grouped by type
- **Seeding**: Achievements are automatically seeded during database creation
- **Unlocking Logic**: Achievements are unlocked based on user activity and progress 