import { supabase } from '@/lib/supabase';
import { DBMarketSnapshot } from '@/types/database';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'YH7LWTCTLRJXIFHM';
const BASE_URL = 'https://www.alphavantage.co/query';

// Fallback stock quotes in case Alpha Vantage limits are hit
const FALLBACK_QUOTES: Record<string, { price: number; change: number; changePercent: string; volume: number }> = {
  NVDA: { price: 135.50, change: 2.30, changePercent: '1.72%', volume: 42000000 },
  AMD: { price: 165.20, change: -1.10, changePercent: '-0.66%', volume: 18000000 },
  INTC: { price: 30.15, change: 0.05, changePercent: '0.17%', volume: 22000000 },
  QCOM: { price: 178.40, change: 1.80, changePercent: '1.02%', volume: 8000000 },
  TSM: { price: 155.80, change: 3.40, changePercent: '2.23%', volume: 12000000 },
  ASML: { price: 920.50, change: 12.00, changePercent: '1.32%', volume: 1500000 }
};

export async function fetchStockQuote(ticker: string): Promise<DBMarketSnapshot | null> {
  try {
    console.log(`Fetching Alpha Vantage quote for ticker: "${ticker}"...`);
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);
    const data = await res.json();

    const quote = data['Global Quote'] || {};
    let price = parseFloat(quote['05. price']);
    let change = parseFloat(quote['09. change']);
    let changePercent = quote['10. change percent'] || '0.00%';
    let volume = parseInt(quote['06. volume'], 10);

    // Handle rate-limit warning or empty quote objects from Alpha Vantage free tier
    if (isNaN(price) || !quote['01. symbol']) {
      console.warn(`Alpha Vantage rate limit hit or empty quote for ${ticker}. Using fallback mock data.`);
      const fallback = FALLBACK_QUOTES[ticker] || { price: 100.0, change: 0, changePercent: '0.0%', volume: 10000 };
      price = fallback.price;
      change = fallback.change;
      changePercent = fallback.changePercent;
      volume = fallback.volume;
    }

    const snapshot: DBMarketSnapshot = {
      id: 'live-' + Date.now() + '-' + ticker,
      created_at: new Date().toISOString(),
      ticker,
      price,
      change,
      change_percent: changePercent,
      volume,
      timestamp: new Date().toISOString()
    };

    return snapshot;
  } catch (err) {
    console.error(`Exception in fetchStockQuote for ${ticker}:`, err);
    return null;
  }
}

export async function fetchAllMarketQuotes(): Promise<DBMarketSnapshot[]> {
  const tickers = ['NVDA', 'AMD', 'INTC', 'QCOM', 'TSM', 'ASML'];
  const results: DBMarketSnapshot[] = [];
  
  for (const ticker of tickers) {
    const quote = await fetchStockQuote(ticker);
    if (quote) results.push(quote);
    // 1.5 second delay to stay under Alpha Vantage free key limits (5 API calls/min, though 6 tickers will take 9s total)
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return results;
}

export async function getMarketOverview(): Promise<DBMarketSnapshot[]> {
  try {
    // Get the latest snapshot for each ticker
    const tickers = ['NVDA', 'AMD', 'INTC', 'QCOM', 'TSM', 'ASML'];
    const results: DBMarketSnapshot[] = [];

    for (const ticker of tickers) {
      const { data, error } = await supabase
        .from('market_snapshots')
        .select('*')
        .eq('ticker', ticker)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        results.push(data as DBMarketSnapshot);
      } else {
        // Return default mock if none in db
        const fallback = FALLBACK_QUOTES[ticker];
        results.push({
          id: 'mock-' + ticker,
          created_at: new Date().toISOString(),
          ticker,
          price: fallback.price,
          change: fallback.change,
          change_percent: fallback.changePercent,
          volume: fallback.volume,
          timestamp: new Date().toISOString()
        });
      }
    }
    return results;
  } catch (err) {
    console.error('Error getting market overview:', err);
    return [];
  }
}
