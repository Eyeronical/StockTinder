"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Flame, Target } from "lucide-react";
import { motion } from "framer-motion";

interface Score {
  name: string;
  streak: number;
  score: number;
  date: string;
}

const MOCK_LEADERS_STREAK = [
  { name: "Warren B.", streak: 42, score: 156 },
  { name: "Rakesh J.", streak: 38, score: 142 },
  { name: "Nithin K.", streak: 35, score: 128 },
  { name: "Elon M.", streak: 29, score: 98 },
  { name: "Peter L.", streak: 25, score: 87 },
];

const MOCK_LEADERS_SCORE = [
  { name: "Warren B.", streak: 42, score: 156 },
  { name: "Rakesh J.", streak: 38, score: 142 },
  { name: "Nithin K.", streak: 35, score: 128 },
  { name: "Peter L.", streak: 25, score: 115 },
  { name: "Elon M.", streak: 29, score: 98 },
];

export default function Leaderboard() {
  const [localBestStreak, setLocalBestStreak] = useState<number>(0);
  const [localBestScore, setLocalBestScore] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>("");
  const [recentScores, setRecentScores] = useState<Score[]>([]);
  const [activeTab, setActiveTab] = useState<"streak" | "score">("streak");

  useEffect(() => {
    const storedName = localStorage.getItem("stockTinderName");
    const storedBestStreak = localStorage.getItem("stockTinderHighStreak");
    const storedBestScore = localStorage.getItem("stockTinderHighScore");
    const storedHistory = localStorage.getItem("stockTinderHistory");

    if (storedName) setPlayerName(storedName);
    if (storedBestStreak) setLocalBestStreak(parseInt(storedBestStreak));
    if (storedBestScore) setLocalBestScore(parseInt(storedBestScore));
    if (storedHistory) {
      setRecentScores(JSON.parse(storedHistory).slice(0, 10));
    }
  }, []);

  const mockLeaders = activeTab === "streak" ? MOCK_LEADERS_STREAK : MOCK_LEADERS_SCORE;
  const localBest = activeTab === "streak" ? localBestStreak : localBestScore;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-3">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Leaderboard</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("streak")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "streak" 
                ? "bg-primary text-background" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4" />
            Best Streak
          </button>
          <button
            onClick={() => setActiveTab("score")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "score" 
                ? "bg-primary text-background" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" />
            Total Score
          </button>
        </div>

        {/* Your Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Trophy className="w-20 h-20 text-primary" />
          </div>
          <p className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
            YOUR BEST {activeTab === "streak" ? "STREAK" : "SCORE"}
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-1">{localBest}</h2>
          <p className="text-gray-400 text-sm">
            Player: <span className="text-white font-semibold">{playerName || "Guest"}</span>
          </p>
        </motion.div>

        {/* Global Leaders */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Global Top Traders
          </h3>
          <div className="space-y-2">
            {mockLeaders.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center justify-between bg-card border border-white/5 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold w-6 text-center text-sm ${index < 3 ? 'text-primary' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium text-sm sm:text-base">{leader.name}</span>
                </div>
                <span className="font-bold text-primary">
                  {activeTab === "streak" ? leader.streak : leader.score}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        {recentScores.length > 0 && (
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Your Recent Runs</h3>
            <div className="space-y-2">
              {recentScores.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-gray-400 text-xs sm:text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      <Flame className="w-3 h-3 inline mr-1" />
                      {entry.streak}
                    </span>
                    <span className="text-white font-bold">
                      <Target className="w-3 h-3 inline mr-1" />
                      {entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play Button */}
        <Link 
          href="/"
          className="mt-6 w-full py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          Play Now
        </Link>
      </div>
    </main>
  );
}
