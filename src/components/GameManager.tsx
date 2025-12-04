"use client";

import { useState, useEffect, useCallback } from "react";
import { SwipeCard } from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { Chart } from "./Chart";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Flame, Zap, Crown, X } from "lucide-react";
import { NameModal } from "./NameModal";
import confetti from "canvas-confetti";

// Celebratory messages based on streak
const getStreakMessage = (streak: number): { text: string; icon: React.ReactNode; color: string } => {
  if (streak >= 10) return { text: "LEGENDARY! 🔥", icon: <Crown className="w-4 h-4" />, color: "text-yellow-400" };
  if (streak >= 7) return { text: "ON FIRE!", icon: <Flame className="w-4 h-4" />, color: "text-orange-500" };
  if (streak >= 5) return { text: "UNSTOPPABLE!", icon: <Zap className="w-4 h-4" />, color: "text-blue-400" };
  if (streak >= 3) return { text: "HOT STREAK!", icon: <Flame className="w-4 h-4" />, color: "text-red-500" };
  return { text: "Nice!", icon: null, color: "text-green-500" };
};

// Check if on mobile
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Fire confetti for wins (reduced for mobile)
const fireConfetti = (intensity: number = 1) => {
  if (isMobile()) intensity *= 0.5;
  
  const count = 80 * intensity;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

  confetti({ ...defaults, particleCount: Math.floor(count * 0.4), spread: 40, startVelocity: 45, colors: ['#26a69a', '#4ade80'] });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.3), spread: 70, colors: ['#fbbf24', '#f59e0b'] });
  confetti({ ...defaults, particleCount: Math.floor(count * 0.3), spread: 90, decay: 0.91, colors: ['#22c55e', '#10b981'] });
};

// Big celebration for streaks
const fireBigCelebration = () => {
  if (isMobile()) {
    confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#ea580c'], zIndex: 9999 });
    return;
  }

  const duration = 1200;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#fbbf24', '#f59e0b'], zIndex: 9999 });
    confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#fbbf24', '#f59e0b'], zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
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
  const [showWrongShake, setShowWrongShake] = useState(false);

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

  const saveScore = (finalStreak: number, finalScore: number) => {
    if (!playerName) return;
    
    const currentHighStreak = parseInt(localStorage.getItem("stockTinderHighStreak") || "0");
    if (finalStreak > currentHighStreak) {
      localStorage.setItem("stockTinderHighStreak", finalStreak.toString());
    }
    
    const currentHighScore = parseInt(localStorage.getItem("stockTinderHighScore") || "0");
    if (finalScore > currentHighScore) {
      localStorage.setItem("stockTinderHighScore", finalScore.toString());
    }

    const history = JSON.parse(localStorage.getItem("stockTinderHistory") || "[]");
    history.unshift({
      name: playerName,
      streak: finalStreak,
      score: finalScore,
      date: new Date().toISOString()
    });
    localStorage.setItem("stockTinderHistory", JSON.stringify(history.slice(0, 20)));
  };

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setGameState("playing");
    setUserChoice(null);
    setIsCorrect(false);
    setShowWrongShake(false);
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
      const newScore = score + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      if (newStreak >= 5) {
        fireBigCelebration();
      } else {
        fireConfetti(1 + newStreak * 0.15);
      }
    } else {
      setShowWrongShake(true);
      saveScore(streak, score);
      setStreak(0);
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  if (!playerName) {
    return <NameModal isOpen={showNameModal} onSubmit={handleNameSubmit} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-base font-light animate-pulse">Finding a setup...</p>
      </div>
    );
  }

  if (!stockData) return null;

  const streakInfo = getStreakMessage(streak);

  return (
    <div className="relative w-full max-w-md mx-auto h-[520px] flex flex-col items-center justify-center">
      {/* Header Stats */}
      <div className="absolute -top-14 w-full flex justify-between px-4 text-white">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
        
        <motion.div 
          className="flex flex-col items-center relative"
          animate={streak >= 3 && !isMobile() ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          <span className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
            Streak
            {streak >= 3 && <Flame className="w-3 h-3 text-orange-500" />}
          </span>
          <span className={`text-2xl font-bold ${streak >= 5 ? 'text-orange-500' : streak >= 3 ? 'text-yellow-500' : 'text-primary'}`}>
            {streak}
          </span>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "playing" ? (
          <SwipeCard key="card" data={stockData} onSwipe={handleSwipe} />
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: showWrongShake ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              x: { duration: 0.4 }
            }}
            className={`w-full h-full bg-card border rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
              showWrongShake ? 'border-red-500/50' : 'border-white/10'
            }`}
          >
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{stockData.symbol.replace('.NS', '')}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${stockData.percentChange > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {stockData.percentChange > 0 ? '+' : ''}{stockData.percentChange.toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-400">Next 7 Days</span>
                  </div>
                </div>
                <motion.div 
                  className={`p-2 rounded-full ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {isCorrect ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </motion.div>
              </div>

              <div className="flex-grow relative bg-black/20 rounded-xl overflow-hidden mb-3">
                <Chart 
                  data={[...stockData.visibleData, ...stockData.futureData]} 
                  colors={{ backgroundColor: 'transparent', textColor: '#9ca3af' }}
                />
              </div>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <h3 className={`text-xl font-bold mb-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
                  </h3>
                  
                  {isCorrect && streak >= 2 && (
                    <motion.div 
                      className={`flex items-center justify-center gap-1 ${streakInfo.color} font-bold text-base mb-2`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {streakInfo.icon}
                      <span>{streakInfo.text}</span>
                      {streakInfo.icon}
                    </motion.div>
                  )}
                  
                  {!isCorrect && (
                    <p className="text-gray-400 text-sm mb-2">Streak lost!</p>
                  )}
                </motion.div>
                
                <motion.button
                  onClick={fetchStock}
                  className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-5 h-5" />
                  Next Chart
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
