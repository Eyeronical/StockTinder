"use client";

import { useState, useEffect, useCallback } from "react";
import { SwipeCard } from "./SwipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { Chart } from "./Chart";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Trophy } from "lucide-react";
import { NameModal } from "./NameModal";
import Link from "next/link";

export const GameManager = () => {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"playing" | "result">("playing");
  const [userChoice, setUserChoice] = useState<"BULLISH" | "BEARISH" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);

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
    
    // Update High Score
    const currentHigh = parseInt(localStorage.getItem("stockTinderHighScore") || "0");
    if (finalScore > currentHigh) {
      localStorage.setItem("stockTinderHighScore", finalScore.toString());
    }

    // Add to History
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

    if (choice === stockData.outcome) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      saveScore(streak); // Save the streak we just lost
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

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col items-center justify-center">
      {/* Header Stats */}
      <div className="absolute -top-16 w-full flex justify-between px-4 text-white">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Streak</span>
          <span className="text-2xl font-bold text-primary">{streak}</span>
        </div>
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
            className="w-full h-full bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
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
                <div className={`p-3 rounded-full ${userChoice === stockData.outcome ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {userChoice === stockData.outcome ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>

              <div className="flex-grow relative bg-black/20 rounded-xl overflow-hidden mb-4">
                 {/* Combine visible and future data for the full chart */}
                 <Chart 
                    data={[...stockData.visibleData, ...stockData.futureData]} 
                    colors={{
                        backgroundColor: 'transparent',
                        textColor: '#9ca3af',
                    }}
                 />
              </div>

              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-2 ${userChoice === stockData.outcome ? 'text-green-500' : 'text-red-500'}`}>
                  {userChoice === stockData.outcome ? 'Correct!' : 'Wrong!'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {userChoice === stockData.outcome 
                    ? "Great read! You spotted the trend." 
                    : "The market had other plans."}
                </p>
                
                <div className="flex gap-3">
                  <Link href="/leaderboard" className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Leaders
                  </Link>
                  <button
                    onClick={fetchStock}
                    className="flex-[2] py-4 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Next Chart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
