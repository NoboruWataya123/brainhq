"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type GameState = "idle" | "playing" | "feedback" | "gameover";

interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  avgReactionTime: number;
  totalTime: number;
}

const SYMBOLS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🫐", "🍑", "🥝", "🍒", "🥭"];
const SHAPES = ["●", "■", "▲", "◆", "★", "♥", "♦", "♣", "♠", "⬢"];
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

interface Card {
  symbol: string;
  color: string;
}

export default function SpeedMatch() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [previousCard, setPreviousCard] = useState<Card | null>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    avgReactionTime: 0,
    totalTime: 0,
  });
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [round, setRound] = useState(0);
  const [maxRounds] = useState(20);
  const [difficulty, setDifficulty] = useState<"symbols" | "shapes" | "mixed">("symbols");
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const cardShowTime = useRef<number>(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateCard = useCallback((): Card => {
    const useSymbols = difficulty === "symbols" || (difficulty === "mixed" && Math.random() > 0.5);
    const pool = useSymbols ? SYMBOLS : SHAPES;
    return {
      symbol: pool[Math.floor(Math.random() * pool.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }, [difficulty]);

  const generateNextCard = useCallback((): Card => {
    // 40% chance to match previous card
    const shouldMatch = previousCard && Math.random() < 0.4;

    if (shouldMatch && previousCard) {
      return { ...previousCard };
    }

    let newCard = generateCard();
    // Make sure it's different if not matching
    while (previousCard && newCard.symbol === previousCard.symbol && newCard.color === previousCard.color) {
      newCard = generateCard();
    }
    return newCard;
  }, [generateCard, previousCard]);

  const startGame = () => {
    setStats({
      score: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      avgReactionTime: 0,
      totalTime: 0,
    });
    setRound(0);
    setReactionTimes([]);
    setTimeLeft(60);
    setPreviousCard(null);

    // First card
    const firstCard = generateCard();
    setCurrentCard(firstCard);
    setPreviousCard(null);
    setGameState("playing");
    cardShowTime.current = Date.now();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = (isMatch: boolean) => {
    if (gameState !== "playing" || !currentCard) return;

    const reactionTime = Date.now() - cardShowTime.current;
    const actualMatch = previousCard &&
      currentCard.symbol === previousCard.symbol &&
      currentCard.color === previousCard.color;

    const isCorrect = isMatch === !!actualMatch;

    // Calculate new reaction times
    const newReactionTimes = [...reactionTimes, reactionTime];
    setReactionTimes(newReactionTimes);

    if (isCorrect) {
      // Correct answer
      const basePoints = 10;
      const speedBonus = Math.max(0, Math.floor((2000 - reactionTime) / 100));
      const streakBonus = stats.streak * 2;
      const points = basePoints + speedBonus + streakBonus;

      setStats((prev) => ({
        ...prev,
        score: prev.score + points,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
        avgReactionTime: newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length,
        totalTime: prev.totalTime + reactionTime,
      }));
      setFeedback("correct");
    } else {
      // Incorrect answer
      setStats((prev) => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        streak: 0,
        avgReactionTime: newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length,
        totalTime: prev.totalTime + reactionTime,
      }));
      setFeedback("incorrect");
    }

    setGameState("feedback");

    // Next round
    setTimeout(() => {
      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= maxRounds || timeLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState("gameover");
      } else {
        setPreviousCard(currentCard);
        const nextCard = generateNextCard();
        setCurrentCard(nextCard);
        setFeedback(null);
        setGameState("playing");
        cardShowTime.current = Date.now();
      }
    }, 400);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        handleAnswer(false);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        handleAnswer(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, currentCard, previousCard]);

  const accuracy = stats.correct + stats.incorrect > 0
    ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card-bg/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl">
              ⚡
            </div>
            <span className="font-bold">Скоростное сопоставление</span>
          </Link>

          {gameState !== "idle" && gameState !== "gameover" && (
            <div className="flex items-center gap-4">
              <div className="text-xl font-mono font-bold text-warning">
                {timeLeft}с
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        {gameState !== "idle" && (
          <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold score-display">{stats.score}</div>
              <div className="text-xs text-foreground/60">Очки</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.correct}</div>
              <div className="text-xs text-foreground/60">Верно</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.streak}</div>
              <div className="text-xs text-foreground/60">Серия</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{round}/{maxRounds}</div>
              <div className="text-xs text-foreground/60">Раунд</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="flex flex-col items-center gap-8">
          {gameState === "idle" ? (
            <div className="game-card p-8 text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-2xl font-bold mb-4">Скоростное сопоставление</h2>
              <p className="text-foreground/60 mb-6">
                Определяйте, совпадает ли текущая карточка с предыдущей.
                Чем быстрее отвечаете — тем больше очков!
              </p>

              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Тренирует рабочую память</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Улучшает скорость реакции</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Развивает внимание</span>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <div className="text-sm text-foreground/60 mb-2">Выберите режим:</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDifficulty("symbols")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      difficulty === "symbols"
                        ? "bg-primary text-white"
                        : "bg-card-bg border border-card-border hover:border-primary"
                    }`}
                  >
                    🍎 Фрукты
                  </button>
                  <button
                    onClick={() => setDifficulty("shapes")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      difficulty === "shapes"
                        ? "bg-primary text-white"
                        : "bg-card-bg border border-card-border hover:border-primary"
                    }`}
                  >
                    ● Фигуры
                  </button>
                  <button
                    onClick={() => setDifficulty("mixed")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      difficulty === "mixed"
                        ? "bg-primary text-white"
                        : "bg-card-bg border border-card-border hover:border-primary"
                    }`}
                  >
                    🎲 Микс
                  </button>
                </div>
              </div>

              <button onClick={startGame} className="btn-primary w-full">
                Начать игру
              </button>

              <div className="mt-4 text-xs text-foreground/40">
                Используйте ← / → или A / D для ответа
              </div>
            </div>
          ) : gameState === "gameover" ? (
            <div className="game-card p-8 text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Отличная работа!</h2>
              <p className="text-foreground/60 mb-6">Результаты тренировки</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="game-card p-4">
                  <div className="text-3xl font-bold score-display">{stats.score}</div>
                  <div className="text-sm text-foreground/60">Очки</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-success">{accuracy}%</div>
                  <div className="text-sm text-foreground/60">Точность</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-primary">{stats.bestStreak}</div>
                  <div className="text-sm text-foreground/60">Лучшая серия</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-secondary">
                    {stats.avgReactionTime > 0 ? Math.round(stats.avgReactionTime) : 0}мс
                  </div>
                  <div className="text-sm text-foreground/60">Ср. время</div>
                </div>
              </div>

              <div className="mb-6 text-sm text-foreground/60">
                Правильных: {stats.correct} | Неправильных: {stats.incorrect}
              </div>

              <div className="flex gap-3">
                <button onClick={startGame} className="btn-primary flex-1">
                  Играть снова
                </button>
                <Link href="/" className="btn-secondary flex-1 text-center">
                  На главную
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Previous Card */}
              <div className="text-center">
                <div className="text-sm text-foreground/60 mb-2">Предыдущая карточка</div>
                <div
                  className={`w-24 h-24 rounded-2xl border-2 border-card-border bg-card-bg flex items-center justify-center text-4xl transition-all ${
                    !previousCard ? "opacity-30" : ""
                  }`}
                >
                  {previousCard ? (
                    <span style={{ color: previousCard.color }}>{previousCard.symbol}</span>
                  ) : (
                    <span className="text-foreground/30">?</span>
                  )}
                </div>
              </div>

              {/* Current Card */}
              <div className="text-center">
                <div className="text-sm text-foreground/60 mb-2">Текущая карточка</div>
                <div
                  className={`w-40 h-40 rounded-3xl border-4 flex items-center justify-center text-7xl transition-all ${
                    feedback === "correct"
                      ? "border-success bg-success/20 animate-pop"
                      : feedback === "incorrect"
                      ? "border-error bg-error/20 animate-shake"
                      : "border-primary bg-card-bg animate-pulse-glow"
                  }`}
                >
                  {currentCard && (
                    <span style={{ color: currentCard.color }}>{currentCard.symbol}</span>
                  )}
                </div>
              </div>

              {/* Answer Buttons */}
              <div className="flex gap-6">
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={gameState !== "playing"}
                  className={`w-32 h-20 rounded-2xl text-lg font-bold transition-all ${
                    gameState === "playing"
                      ? "bg-error/20 border-2 border-error text-error hover:bg-error hover:text-white"
                      : "opacity-50 cursor-not-allowed bg-card-bg border-2 border-card-border"
                  }`}
                >
                  Разные
                  <div className="text-xs opacity-60 mt-1">← / A</div>
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={gameState !== "playing"}
                  className={`w-32 h-20 rounded-2xl text-lg font-bold transition-all ${
                    gameState === "playing"
                      ? "bg-success/20 border-2 border-success text-success hover:bg-success hover:text-white"
                      : "opacity-50 cursor-not-allowed bg-card-bg border-2 border-card-border"
                  }`}
                >
                  Совпадают
                  <div className="text-xs opacity-60 mt-1">→ / D</div>
                </button>
              </div>

              {/* Hint for first card */}
              {!previousCard && (
                <div className="text-sm text-foreground/40 text-center">
                  Это первая карточка. Запомните её и нажмите любую кнопку.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
