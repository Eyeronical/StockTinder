"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Chart } from "./Chart";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface SwipeCardProps {
  data: any;
  onSwipe: (direction: "left" | "right") => void;
}

export const SwipeCard = ({ data, onSwipe }: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Overlay opacity for feedback
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const leftOpacity = useTransform(x, [0, -150], [0, 1]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(1000);
      onSwipe("right");
    } else if (info.offset.x < -100) {
      setExitX(-1000);
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX, opacity: exitX !== 0 ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className="absolute w-full max-w-md h-[500px] bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Feedback Overlays */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className="border-4 border-green-500 rounded-full p-4 transform rotate-12">
          <Check className="w-16 h-16 text-green-500" />
        </div>
      </motion.div>
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className="border-4 border-red-500 rounded-full p-4 transform -rotate-12">
          <X className="w-16 h-16 text-red-500" />
        </div>
      </motion.div>

      {/* Card Content */}
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">???</h2>
          <span className="text-sm text-gray-400">NSE</span>
        </div>
        
        <div className="flex-grow relative">
          <Chart data={data.visibleData} />
          
          {/* Gradient overlay to hide the right side slightly if needed, or just style */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-card via-transparent to-transparent opacity-20" />
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Swipe right if Bullish, left if Bearish</p>
          <div className="flex justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
              <Check className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
