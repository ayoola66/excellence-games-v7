"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameSession {
  id: string;
  status: string;
  score: number;
  currentQuestionIndex: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  type: string;
  timeLimit: number;
}

export default function TestGamePage() {
  const [playerEmail, setPlayerEmail] = useState("testplayer@example.com");
  const [playerPassword, setPlayerPassword] = useState("password123");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [gameCompleted, setGameCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const loginPlayer = async () => {
    try {
      const response = await fetch("/api/player/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: playerEmail,
          password: playerPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        addLog(`Player logged in: ${data.player.email}`);
      } else {
        addLog(`Login failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`Login error: ${error.message}`);
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: crypto.randomUUID(), // Mock game ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGameSession(data.session);
        setCurrentQuestion(data.currentQuestion);
        addLog(`Game started: Session ${data.session.id}`);
      } else {
        addLog(`Game start failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`Game start error: ${error.message}`);
    }
  };

  const submitAnswer = async () => {
    if (!gameSession || !currentQuestion || !selectedAnswer) return;

    try {
      const response = await fetch(`/api/game/${gameSession.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: selectedAnswer,
          timeTaken: 15, // Mock time
        }),
      });

      const data = await response.json();

      if (data.success) {
        addLog(
          `Answer submitted: ${data.isCorrect ? "Correct" : "Incorrect"} (+${data.pointsEarned} points)`,
        );

        if (data.gameCompleted) {
          setGameCompleted(true);
          addLog(`Game completed! Final score: ${data.finalScore}`);
        } else {
          setCurrentQuestion(data.nextQuestion);
          setSelectedAnswer("");
        }
      } else {
        addLog(`Answer submission failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`Answer submission error: ${error.message}`);
    }
  };

  const resetTest = () => {
    setIsLoggedIn(false);
    setGameSession(null);
    setCurrentQuestion(null);
    setSelectedAnswer("");
    setGameCompleted(false);
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Game API Test Interface</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          {!isLoggedIn ? (
            <Card>
              <CardHeader>
                <CardTitle>Player Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={playerPassword}
                  onChange={(e) => setPlayerPassword(e.target.value)}
                />
                <Button onClick={loginPlayer} className="w-full">
                  Login Player
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Game Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-green-600">✅ Player logged in</p>

                  {!gameSession ? (
                    <Button onClick={startGame} className="w-full">
                      Start Game
                    </Button>
                  ) : gameCompleted ? (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        🎉 Game Completed!
                      </p>
                      <Button onClick={resetTest} className="mt-2">
                        Reset Test
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-semibold">Current Question:</p>
                      <p>{currentQuestion?.text}</p>

                      <div className="space-y-2">
                        {currentQuestion?.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={selectedAnswer === option}
                              onChange={(e) =>
                                setSelectedAnswer(e.target.value)
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>

                      <Button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer}
                        className="w-full"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>API Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm mb-1 font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
            {logs.length > 0 && (
              <Button
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Clear Logs
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
