"use client";

import Link from "next/link";

const games = [
  {
    id: "memory-matrix",
    title: "Матрица памяти",
    description: "Запоминайте расположение подсвеченных клеток и воспроизводите паттерн",
    icon: "🧠",
    color: "from-purple-500 to-indigo-600",
    skills: ["Визуальная память", "Концентрация", "Пространственное мышление"],
    difficulty: "Адаптивная",
  },
  {
    id: "speed-match",
    title: "Скоростное сопоставление",
    description: "Определяйте, совпадает ли текущий символ с предыдущим",
    icon: "⚡",
    color: "from-cyan-500 to-blue-600",
    skills: ["Рабочая память", "Скорость реакции", "Внимание"],
    difficulty: "Адаптивная",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card-bg/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
              🧠
            </div>
            <h1 className="text-xl font-bold text-foreground">BrainHQ</h1>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-foreground/60">MVP v1.0</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="score-display">Тренируйте свой мозг</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
            Научно обоснованные упражнения для улучшения памяти, внимания и скорости мышления.
            Начните тренировку прямо сейчас!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16">
          <div className="game-card p-4">
            <div className="text-2xl font-bold text-primary">2</div>
            <div className="text-sm text-foreground/60">Игры</div>
          </div>
          <div className="game-card p-4">
            <div className="text-2xl font-bold text-secondary">5+</div>
            <div className="text-sm text-foreground/60">Навыков</div>
          </div>
          <div className="game-card p-4">
            <div className="text-2xl font-bold text-success">∞</div>
            <div className="text-sm text-foreground/60">Уровней</div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">Выберите тренировку</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {games.map((game, index) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="game-card p-6 h-full animate-fade-in">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1">{game.title}</h4>
                    <p className="text-foreground/60 text-sm">{game.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {game.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-card-border">
                  <span className="text-sm text-foreground/60">
                    Сложность: <span className="text-primary">{game.difficulty}</span>
                  </span>
                  <span className="btn-primary text-sm py-2 px-4">
                    Играть →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="game-card p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Как это работает?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
              <div>
                <h4 className="font-semibold mb-1">Выберите игру</h4>
                <p className="text-sm text-foreground/60">Каждая игра тренирует определённые когнитивные навыки</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
              <div>
                <h4 className="font-semibold mb-1">Тренируйтесь</h4>
                <p className="text-sm text-foreground/60">Сложность адаптируется под ваш уровень автоматически</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
              <div>
                <h4 className="font-semibold mb-1">Развивайтесь</h4>
                <p className="text-sm text-foreground/60">Отслеживайте прогресс и улучшайте результаты</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-foreground/40 text-sm">
          <p>BrainHQ MVP - Тренировка мозга</p>
        </div>
      </footer>
    </div>
  );
}
