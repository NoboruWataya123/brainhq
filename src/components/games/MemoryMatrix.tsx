"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type GameState = "idle" | "showing" | "input" | "result" | "gameover";

interface GameStats {
  level: number;
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
}

export default function MemoryMatrix() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [cellStates, setCellStates] = useState<Record<number, "correct" | "incorrect" | "active" | null>>({});
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    score: 0,
    lives: 3,
    streak: 0,
    bestStreak: 0,
  });
  const [showingIndex, setShowingIndex] = useState(-1);
  const [message, setMessage] = useState("");

  const totalCells = gridSize * gridSize;
  const patternLength = Math.min(Math.floor(gridSize * 0.6) + stats.level, totalCells - 1);

  const generatePattern = useCallback(() => {
    const newPattern: number[] = [];
    while (newPattern.length < patternLength) {
      const cell = Math.floor(Math.random() * totalCells);
      if (!newPattern.includes(cell)) {
        newPattern.push(cell);
      }
    }
    return newPattern;
  }, [patternLength, totalCells]);

  const startGame = () => {
    setStats({
      level: 1,
      score: 0,
      lives: 3,
      streak: 0,
      bestStreak: 0,
    });
    setGridSize(3);
    startRound();
  };

  const startRound = useCallback(() => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserSelection([]);
    setCellStates({});
    setGameState("showing");
    setMessage("Запомните расположение");

    // Show pattern with animation
    let index = 0;
    const showInterval = setInterval(() => {
      if (index < newPattern.length) {
        setShowingIndex(newPattern[index]);
        index++;
      } else {
        clearInterval(showInterval);
        setShowingIndex(-1);

        // Brief pause then allow input
        setTimeout(() => {
          setGameState("input");
          setMessage("Воспроизведите паттерн");
        }, 500);
      }
    }, 600);

    return () => clearInterval(showInterval);
  }, [generatePattern]);

  useEffect(() => {
    if (gameState === "showing") {
      const cleanup = startRound();
      return cleanup;
    }
  }, []);

  const handleCellClick = (index: number) => {
    if (gameState !== "input") return;
    if (userSelection.includes(index)) return;

    const newSelection = [...userSelection, index];
    setUserSelection(newSelection);

    if (pattern.includes(index)) {
      setCellStates((prev) => ({ ...prev, [index]: "correct" }));

      // Check if complete
      if (newSelection.filter(i => pattern.includes(i)).length === pattern.length) {
        handleSuccess();
      }
    } else {
      setCellStates((prev) => ({ ...prev, [index]: "incorrect" }));
      handleFailure();
    }
  };

  const handleSuccess = () => {
    setGameState("result");
    const newStreak = stats.streak + 1;
    const levelBonus = stats.level * 10;
    const streakBonus = newStreak * 5;
    const newScore = stats.score + patternLength * 10 + levelBonus + streakBonus;

    setStats((prev) => ({
      ...prev,
      score: newScore,
      streak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      level: prev.level + 1,
    }));

    setMessage(`Отлично! +${patternLength * 10 + levelBonus + streakBonus} очков`);

    // Increase difficulty
    if (stats.level % 3 === 0 && gridSize < 6) {
      setGridSize((prev) => prev + 1);
    }

    setTimeout(() => {
      const newPattern = generatePattern();
      setPattern(newPattern);
      setUserSelection([]);
      setCellStates({});
      setGameState("showing");
      setMessage("Запомните расположение");

      let index = 0;
      const showInterval = setInterval(() => {
        if (index < newPattern.length) {
          setShowingIndex(newPattern[index]);
          index++;
        } else {
          clearInterval(showInterval);
          setShowingIndex(-1);
          setTimeout(() => {
            setGameState("input");
            setMessage("Воспроизведите паттерн");
          }, 500);
        }
      }, 600);
    }, 1500);
  };

  const handleFailure = () => {
    const newLives = stats.lives - 1;

    setStats((prev) => ({
      ...prev,
      lives: newLives,
      streak: 0,
    }));

    if (newLives <= 0) {
      setGameState("gameover");
      setMessage("Игра окончена!");

      // Show correct pattern
      const correctStates: Record<number, "correct" | "incorrect" | "active" | null> = {};
      pattern.forEach(i => {
        if (!cellStates[i]) {
          correctStates[i] = "active";
        }
      });
      setCellStates(prev => ({ ...prev, ...correctStates }));
    } else {
      setMessage(`Неверно! Осталось жизней: ${newLives}`);

      // Show correct pattern briefly
      setTimeout(() => {
        const correctStates: Record<number, "correct" | "incorrect" | "active" | null> = {};
        pattern.forEach(i => {
          if (!cellStates[i]) {
            correctStates[i] = "active";
          }
        });
        setCellStates(prev => ({ ...prev, ...correctStates }));
      }, 500);

      setTimeout(() => {
        const newPattern = generatePattern();
        setPattern(newPattern);
        setUserSelection([]);
        setCellStates({});
        setGameState("showing");
        setMessage("Запомните расположение");

        let index = 0;
        const showInterval = setInterval(() => {
          if (index < newPattern.length) {
            setShowingIndex(newPattern[index]);
            index++;
          } else {
            clearInterval(showInterval);
            setShowingIndex(-1);
            setTimeout(() => {
              setGameState("input");
              setMessage("Воспроизведите паттерн");
            }, 500);
          }
        }, 600);
      }, 2000);
    }
  };

  const getCellClass = (index: number) => {
    const baseClass = "game-cell aspect-square rounded-xl border-2 border-card-border bg-card-bg flex items-center justify-center transition-all duration-200";

    if (showingIndex === index) {
      return `${baseClass} active`;
    }

    if (cellStates[index] === "correct") {
      return `${baseClass} correct`;
    }

    if (cellStates[index] === "incorrect") {
      return `${baseClass} incorrect animate-shake`;
    }

    if (cellStates[index] === "active") {
      return `${baseClass} active`;
    }

    if (gameState === "input" && !userSelection.includes(index)) {
      return `${baseClass} hover:border-primary hover:bg-primary/10`;
    }

    return baseClass;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card-bg/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl">
              🧠
            </div>
            <span className="font-bold">Матрица памяти</span>
          </Link>

          {gameState !== "idle" && gameState !== "gameover" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < stats.lives ? "" : "opacity-30"}`}>
                    ❤️
                  </span>
                ))}
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
              <div className="text-2xl font-bold text-primary">{stats.level}</div>
              <div className="text-xs text-foreground/60">Уровень</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold score-display">{stats.score}</div>
              <div className="text-xs text-foreground/60">Очки</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.streak}</div>
              <div className="text-xs text-foreground/60">Серия</div>
            </div>
            <div className="game-card p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.bestStreak}</div>
              <div className="text-xs text-foreground/60">Лучшая</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="flex flex-col items-center gap-8">
          {gameState === "idle" ? (
            <div className="game-card p-8 text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-6">🧠</div>
              <h2 className="text-2xl font-bold mb-4">Матрица памяти</h2>
              <p className="text-foreground/60 mb-6">
                Запоминайте расположение подсвеченных клеток и воспроизводите паттерн.
                С каждым уровнем сложность увеличивается!
              </p>
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Тренирует визуальную память</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Улучшает концентрацию</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">✓</span>
                  <span>Адаптивная сложность</span>
                </div>
              </div>
              <button onClick={startGame} className="btn-primary w-full">
                Начать игру
              </button>
            </div>
          ) : gameState === "gameover" ? (
            <div className="game-card p-8 text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Игра окончена!</h2>
              <p className="text-foreground/60 mb-6">Отличная тренировка!</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="game-card p-4">
                  <div className="text-3xl font-bold score-display">{stats.score}</div>
                  <div className="text-sm text-foreground/60">Финальный счёт</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-primary">{stats.level}</div>
                  <div className="text-sm text-foreground/60">Уровень</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-success">{stats.bestStreak}</div>
                  <div className="text-sm text-foreground/60">Лучшая серия</div>
                </div>
                <div className="game-card p-4">
                  <div className="text-3xl font-bold text-secondary">{gridSize}x{gridSize}</div>
                  <div className="text-sm text-foreground/60">Макс. сетка</div>
                </div>
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
              {/* Message */}
              <div className={`text-xl font-semibold text-center h-8 ${
                message.includes("Отлично") ? "text-success" :
                message.includes("Неверно") ? "text-error" : "text-foreground"
              }`}>
                {message}
              </div>

              {/* Grid */}
              <div
                className="grid gap-3 p-4 bg-card-bg/50 rounded-2xl border border-card-border"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  width: `min(90vw, ${gridSize * 80}px)`,
                }}
              >
                {[...Array(totalCells)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState !== "input"}
                    className={getCellClass(index)}
                    style={{ minHeight: "60px" }}
                  />
                ))}
              </div>

              {/* Progress */}
              {gameState === "input" && (
                <div className="text-center text-foreground/60">
                  Выбрано: {userSelection.filter(i => pattern.includes(i)).length} / {pattern.length}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
