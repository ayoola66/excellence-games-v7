-- Game Sessions and Player Management Tables
-- Run this on your local database

-- Players table (separate from admin users)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL, -- References your existing games table
  player_id UUID REFERENCES players(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  current_question_index INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Player answers table
CREATE TABLE IF NOT EXISTS player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL, -- References your existing questions table
  answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT NOW(),
  time_taken INTEGER -- in seconds
);

-- Game statistics table
CREATE TABLE IF NOT EXISTS game_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL, -- References your existing games table
  total_plays INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_per_question INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Player sessions (for authentication)
CREATE TABLE IF NOT EXISTS player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_player_answers_session_id ON player_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_token ON player_sessions(token);
CREATE INDEX IF NOT EXISTS idx_player_sessions_player_id ON player_sessions(player_id);

-- Insert some test data
INSERT INTO players (email, username, first_name, last_name, password_hash) VALUES
('testplayer@example.com', 'testplayer', 'Test', 'Player', '$2b$10$example_hash_here'),
('player2@example.com', 'player2', 'Player', 'Two', '$2b$10$example_hash_here')
ON CONFLICT (email) DO NOTHING;