"use client";

import { useState, useEffect, useCallback } from "react";
import { SwipeCard } from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { Chart } from "./Chart";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Trophy, Flame, Zap, Crown } from "lucide-react";
import { NameModal } from "./NameModal";
import Link from "next/link";
import confetti from "canvas-confetti";

// Celebratory messages based on streak
const getStreakMessage = (streak: number): { text: string; icon: React.ReactNode; color: string } => {
  if (streak >= 10) return { text: "LEGENDARY! 🔥", icon: <Crown className="w-5 h-5" />, color: "text-yellow-400" };
  if (streak >= 7) return { text: "ON FIRE!", icon: <Flame className="w-5 h-5" />, color: "text-orange-500" };
  if (streak >= 5) return { text: "UNSTOPPABLE!", icon: <Zap className="w-5 h-5" />, color: "text-blue-400" };
  if (streak >= 3) return { text: "HOT STREAK!", icon: <Flame className="w-5 h-5" />, color: "text-red-500" };
  return { text: "Nice!", icon: null, color: "text-green-500" };
};

// Fire confetti for wins
const fireConfetti = (intensity: number = 1) => {
  const count = 100 * intensity;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#26a69a', '#4ade80'] });
  fire(0.2, { spread: 60, colors: ['#fbbf24', '#f59e0b'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#22c55e', '#10b981'] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#eab308', '#facc15'] });
  fire(0.1, { spread: 120, startVelocity: 45, colors: ['#84cc16', '#a3e635'] });
};

// Big celebration for streaks
const fireBigCelebration = () => {
  const duration = 1500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fbbf24', '#f59e0b', '#ea580c'],
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#fbbf24', '#f59e0b', '#ea580c'],
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const GameManager = () => {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"playing" | "result">("playing");
  const [userChoice, setUserChoice] = useState<"BULLISH" | "BEARISH" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showStreakEffect, setShowStreakEffect] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("stockTinderName");
    if (storedName) {
      setPlayerName(storedName);
    } else {
      setShowNameModal(true);
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    localStorage.setItem("stockTinderName", name);
    setPlayerName(name);
    setShowNameModal(false);
  };

  const saveScore = (finalScore: number) => {
    if (!playerName) return;
    
    const currentHigh = parseInt(localStorage.getItem("stockTinderHighScore") || "0");
    if (finalScore > currentHigh) {
      localStorage.setItem("stockTinderHighScore", finalScore.toString());
    }

    const history = JSON.parse(localStorage.getItem("stockTinderHistory") || "[]");
    history.unshift({
      name: playerName,
      score: finalScore,
      date: new Date().toISOString()
    });
    localStorage.setItem("stockTinderHistory", JSON.stringify(history));
  };

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setGameState("playing");
    setUserChoice(null);
    setIsCorrect(false);
    setShowStreakEffect(false);
    try {
      const res = await fetch("/api/stocks");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStockData(data);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (playerName) {
      fetchStock();
    }
  }, [fetchStock, playerName]);

  const handleSwipe = (direction: "left" | "right") => {
    const choice = direction === "right" ? "BULLISH" : "BEARISH";
    setUserChoice(choice);
    setGameState("result");

    const correct = choice === stockData.outcome;
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(newStreak);
      
      // Trigger confetti based on streak
      if (newStreak >= 5) {
        fireBigCelebration();
        setShowStreakEffect(true);
      } else {
        fireConfetti(1 + newStreak * 0.2);
      }
    } else {
      saveScore(streak);
      setStreak(0);
    }
  };

  if (!playerName) {
    return <NameModal isOpen={showNameModal} onSubmit={handleNameSubmit} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-light animate-pulse">Finding a setup...</p>
      </div>
    );
  }

  if (!stockData) return null;

  const streakInfo = getStreakMessage(streak);

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center">
      {/* Header Stats */}
      <div className="absolute -top-16 w-full flex justify-between px-4 text-white">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
        
        {/* Streak with fire effect */}
        <motion.div 
          className="flex flex-col items-center relative"
          animate={streak >= 3 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
            Streak
            {streak >= 3 && <Flame className="w-3 h-3 text-orange-500 animate-pulse" />}
          </span>
          <span className={`text-2xl font-bold ${streak >= 5 ? 'text-orange-500' : streak >= 3 ? 'text-yellow-500' : 'text-primary'}`}>
            {streak}
          </span>
          
          {/* Fire glow effect */}
          {streak >= 5 && (
            <motion.div 
              className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl -z-10"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "playing" ? (
          <SwipeCard key="card" data={stockData} onSwipe={handleSwipe} />
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full h-full bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Streak Effect Overlay */}
            {showStreakEffect && (
              <motion.div 
                className="absolute inset-0 pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 via-transparent to-yellow-500/10" />
              </motion.div>
            )}

            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{stockData.symbol.replace('.NS', '')}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${stockData.percentChange > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {stockData.percentChange > 0 ? '+' : ''}{stockData.percentChange.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">Next 7 Days</span>
                  </div>
                </div>
                <motion.div 
                  className={`p-3 rounded-full ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: isCorrect ? [0, 10, -10, 0] : [0, -5, 5, 0] }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {isCorrect ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                </motion.div>
              </div>

              <div className="flex-grow relative bg-black/20 rounded-xl overflow-hidden mb-4">
                <Chart 
                  data={[...stockData.visibleData, ...stockData.futureData]} 
                  colors={{
                    backgroundColor: 'transparent',
                    textColor: '#9ca3af',
                  }}
                />
              </div>

              <div className="text-center">
                {/* Result Message */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <h3 className={`text-2xl font-bold mb-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? 'Correct!' : 'Wrong!'}
                  </h3>
                  
                  {/* Streak Message */}
                  {isCorrect && streak >= 2 && (
                    <motion.div 
                      className={`flex items-center justify-center gap-2 ${streakInfo.color} font-bold text-lg mb-3`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {streakInfo.icon}
                      <span>{streakInfo.text}</span>
                      {streakInfo.icon}
                    </motion.div>
                  )}
                </motion.div>

                <p className="text-gray-400 text-sm mb-6">
                  {isCorrect 
                    ? streak >= 5 
                      ? "You're reading the market like a pro!" 
                      : "Great read! You spotted the trend."
                    : "The market had other plans."}
                </p>
                
                <div className="flex gap-3">
                  <Link href="/leaderboard" className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Leaders
                  </Link>
                  <motion.button
                    onClick={fetchStock}
                    className="flex-[2] py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Next Chart
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
