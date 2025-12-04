"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

interface Score {
  name: string;
  score: number;
  date: string;
}

const MOCK_LEADERS = [
  { name: "Warren B.", score: 42, date: "2023-10-15" },
  { name: "Rakesh J.", score: 38, date: "2023-11-02" },
  { name: "Harshad M.", score: 35, date: "1992-04-20" },
  { name: "Elon M.", score: 29, date: "2024-01-10" },
  { name: "Nithin K.", score: 25, date: "2023-12-05" },
];

export default function Leaderboard() {
  const [localBest, setLocalBest] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>("");
  const [recentScores, setRecentScores] = useState<Score[]>([]);

  useEffect(() => {
    const storedName = localStorage.getItem("stockTinderName");
    const storedBest = localStorage.getItem("stockTinderHighScore");
    const storedHistory = localStorage.getItem("stockTinderHistory");

    if (storedName) setPlayerName(storedName);
    if (storedBest) setLocalBest(parseInt(storedBest));
    if (storedHistory) {
      setRecentScores(JSON.parse(storedHistory).slice(0, 10)); // Top 10 recent
    }
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-4">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>

        {/* Your Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 text-primary" />
          </div>
          <p className="text-primary font-bold mb-1">YOUR BEST STREAK</p>
          <h2 className="text-5xl font-black text-white mb-2">{localBest}</h2>
          <p className="text-gray-400 text-sm">Player: <span className="text-white font-semibold">{playerName || "Guest"}</span></p>
        </motion.div>

        {/* Global Leaders */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Medal className="w-4 h-4" /> Global Top Traders
          </h3>
          <div className="space-y-3">
            {MOCK_LEADERS.map((leader, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-card border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-4">
                  <span className={`font-bold w-6 text-center ${index < 3 ? 'text-primary' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium">{leader.name}</span>
                </div>
                <span className="font-bold text-primary">{leader.score}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        {recentScores.length > 0 && (
          <div>
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Your Recent Runs</h3>
            <div className="space-y-3">
              {recentScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3 px-4">
                  <span className="text-gray-400 text-sm">{new Date(score.date).toLocaleDateString()}</span>
                  <span className="text-white font-bold">{score.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
