import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });
import { INDIAN_STOCKS } from "@/lib/stocks";

export const dynamic = 'force-dynamic';

// Minimum % change to be considered "dramatic"
const DRAMATIC_THRESHOLD = 6; // 6% move in 7 days

interface DramaticMove {
  startIndex: number;
  endIndex: number;
  percentChange: number;
}

function findDramaticMoves(quotes: any[]): DramaticMove[] {
  const dramaticMoves: DramaticMove[] = [];
  
  // We need at least 67 days (60 visible + 7 future)
  if (quotes.length < 67) return [];
  
  // Scan through the data looking for 7-day periods with dramatic moves
  // Start from index 60 (so we have 60 days of history to show)
  for (let i = 60; i <= quotes.length - 7; i++) {
    const startClose = quotes[i].close;
    const endClose = quotes[i + 6].close; // 7 days later (0-indexed, so +6)
    
    if (!startClose || !endClose) continue;
    
    const percentChange = ((endClose - startClose) / startClose) * 100;
    
    // Check if this is a dramatic move (up OR down)
    if (Math.abs(percentChange) >= DRAMATIC_THRESHOLD) {
      dramaticMoves.push({
        startIndex: i,
        endIndex: i + 6,
        percentChange
      });
    }
  }
  
  return dramaticMoves;
}

export async function GET() {
  try {
    // Shuffle stocks to avoid always starting with the same ones
    const shuffledStocks = [...INDIAN_STOCKS].sort(() => Math.random() - 0.5);
    
    // Try multiple stocks to find one with dramatic moves
    for (let attempt = 0; attempt < 15; attempt++) {
      const randomStock = shuffledStocks[attempt % shuffledStocks.length];
      
      try {
        // Fetch 2 years of data to find dramatic moves
        const today = new Date();
        const twoYearsAgo = new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000);
        
        const queryOptions = {
          period1: twoYearsAgo.toISOString().split('T')[0],
          period2: today.toISOString().split('T')[0],
          interval: '1d' as const,
        };

        const result = await yahooFinance.chart(randomStock, queryOptions);
        const quotes = result.quotes;

        if (!quotes || quotes.length < 100) {
          continue; // Not enough data
        }

        // Find all dramatic moves in this stock's history
        const dramaticMoves = findDramaticMoves(quotes);
        
        if (dramaticMoves.length === 0) {
          continue; // No dramatic moves found, try another stock
        }

        // Pick a random dramatic move
        const selectedMove = dramaticMoves[Math.floor(Math.random() * dramaticMoves.length)];
        
        // Get 60 days before the dramatic move
        const visibleStartIndex = selectedMove.startIndex - 60;
        if (visibleStartIndex < 0) continue;

        const visibleData = quotes.slice(visibleStartIndex, selectedMove.startIndex).map(item => ({
          time: item.date.toISOString().split('T')[0],
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        // The 7 days of dramatic movement
        const futureData = quotes.slice(selectedMove.startIndex, selectedMove.endIndex + 1).map(item => ({
          time: item.date.toISOString().split('T')[0],
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        // Validate data
        if (visibleData.length < 50 || futureData.length < 5) continue;
        
        const lastVisibleClose = visibleData[visibleData.length - 1].close || 0;
        const finalFutureClose = futureData[futureData.length - 1].close || 0;
        
        if (lastVisibleClose === 0 || finalFutureClose === 0) continue;

        const percentChange = ((finalFutureClose - lastVisibleClose) / lastVisibleClose) * 100;
        const outcome = percentChange > 0 ? "BULLISH" : "BEARISH";

        return NextResponse.json({
          symbol: randomStock,
          visibleData,
          futureData,
          outcome,
          percentChange,
          dramaticMove: true // Flag to indicate this is a dramatic move
        });

      } catch (err) {
        console.error(`Error fetching ${randomStock}:`, err);
        continue;
      }
    }

    return NextResponse.json({ error: "Failed to find dramatic stock moves after retries" }, { status: 500 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
