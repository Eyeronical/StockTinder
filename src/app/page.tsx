import { GameManager } from "@/components/GameManager";
import Link from "next/link";
import { Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header with Leaderboard */}
      <div className="absolute top-4 right-4 z-20">
        <Link 
          href="/leaderboard" 
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-colors"
        >
          <Trophy className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
      </div>

      <div className="text-center mb-6 z-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Stock<span className="text-primary">Tinder</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Swipe to predict the market</p>
      </div>

      <div className="w-full max-w-md z-10">
        <GameManager />
      </div>
    </main>
  );
}
