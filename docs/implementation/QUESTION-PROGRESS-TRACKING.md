# Question Progress Tracking System

## Overview

The Question Progress Tracking system provides users with a visual representation of their progress through game questions. It tracks which questions have been answered, displays completion percentages, and organizes progress by categories.

## Features

- **Overall Progress Tracking**: Shows total questions answered vs. total available
- **Category-Based Progress**: Breaks down progress by individual categories
- **Visual Progress Bars**: Displays completion percentages graphically
- **Last Activity Timestamp**: Shows when the user last answered a question
- **Persistent Progress**: Progress is stored in the database and persists between sessions

## Implementation Details

### Backend Components

1. **Database Schema**:
   - `question_progresses` collection in Strapi
   - Tracks user, game, question, category, answer status, and correctness
   - Includes timestamps and attempt counts

2. **API Endpoints**:
   - `GET /api/question-progresses/game/:gameId/user/:userId`: Retrieves progress for a specific game and user
   - `POST /api/question-progresses/update`: Updates progress after answering a question

3. **Performance Optimizations**:
   - Database indexes for faster lookups
   - Efficient query structure for progress calculations

### Frontend Components

1. **Progress Tracker Service** (`progressTracker.ts`):
   - Handles API communication for progress data
   - Provides utility functions for calculating percentages

2. **QuestionProgressTracker Component**:
   - Visual representation of progress
   - Shows overall and category-specific completion
   - Displays remaining questions count
   - Shows last activity timestamp

3. **Game Integration**:
   - Integrated into both StraightGame and NestedGame components
   - Updates progress automatically when questions are answered

## Usage

The progress tracker appears automatically in game interfaces for authenticated users. Progress is updated in real-time as questions are answered.

### Progress Data Structure

```typescript
interface QuestionProgress {
  gameId: string;
  userId: string;
  questionsTotal: number;
  questionsAnswered: number;
  questionsRemaining: number;
  lastAnswered?: string;
  categories: {
    [categoryId: string]: {
      id: string;
      name: string;
      total: number;
      answered: number;
      remaining: number;
    }
  }
}
```

## Future Enhancements

The system is designed to support future features that are currently dormant:

1. **Achievement System**:
   - Will use progress data to award achievements
   - Database schema prepared but inactive

2. **Social Features**:
   - Progress sharing with friends
   - Competitive progress comparison

3. **Leaderboards**:
   - Ranking based on progress and correctness
   - Category-specific leaderboards

## Setup and Maintenance

### Database Indexes

Run the script to create necessary database indexes:

```bash
node scripts/create-progress-indexes.js
```

This will create the following indexes:
- `idx_question_progress_user_game`: For faster lookups by user and game
- `idx_question_progress_category`: For category-based queries
- `idx_question_progress_question`: For question-specific lookups 