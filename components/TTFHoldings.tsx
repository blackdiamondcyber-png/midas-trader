'use client'

import { useState, useEffect } from 'react'

const API_BASE = '/api/trading'

interface Holding {
  ticker: string
  shares: number
  avg_cost: number
  source: string
  confidence: string
  mention_count: number
  added_at: string
  last_updated: string
  live_price: number | null
  price_stale: boolean
  unrealized_pnl: number | null
}

interface HoldingsResponse {
  holdings: Holding[]
}

function confidenceColor(conf: string): string {
  switch (conf?.toLowerCase()) {
    case 'high': return 'text-green-400'
    case 'medium': return 'text-yellow-400'
    default: return 'text-slate-500'
  }
}

export default function TTFHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [lastScrape, setLastScrape] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        // Also pull last_scrape from health
        const [holdingsRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/holdings`),
          fetch(`${API_BASE}/health`),
        ])
        const holdingsData: HoldingsResponse = await holdingsRes.json()
        const healthData = await healthRes.json()

        // Sort by mention_count desc, take top 5
        const sorted = (holdingsData.holdings ?? [])
          .sort((a, b) => (b.mention_count ?? 0) - (a.mention_count ?? 0))
          .slice(0, 5)

        setHoldings(sorted)
        setLastScrape(healthData.last_scrape ?? null)
        setError(null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Fetch failed')
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
    const interval = setInterval(fetchHoldings, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatScrapeTime = (iso: string | null) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return iso
    }
  }

  const maxMentions = holdings[0]?.mention_count ?? 1

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">TTF Holdings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Top tickers by mention count</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last scrape</p>
          <p className="text-xs text-slate-400 font-mono">{formatScrapeTime(lastScrape)}</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <p className="text-xs text-red-400">⚠ {error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Holdings list */}
      {!loading && holdings.length === 0 && !error && (
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-6 text-center">
          <p className="text-sm text-slate-500">No holdings data yet</p>
          <p className="text-xs text-slate-600 mt-1">TTF scraper may not have run</p>
        </div>
      )}

      {!loading && holdings.length > 0 && (
        <div className="space-y-2">
          {holdings.map((h, idx) => {
            const barWidth = Math.max(8, Math.round((h.mention_count / maxMentions) * 100))
            return (
              <div
                key={h.ticker}
                className="relative rounded-lg border border-gray-700 bg-gray-900/50 backdrop-blur px-4 py-3 overflow-hidden"
              >
                {/* Mention bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-orange-500/8 rounded-lg"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative flex items-center justify-between">
                  {/* Rank + Ticker */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-4 text-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-black text-white tracking-wide">{h.ticker}</span>
                      <span className="ml-2 text-xs text-slate-500">{h.source?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-right">
                    {/* Live price */}
                    {h.live_price && (
                      <div>
                        <p className="text-xs font-mono text-white">${h.live_price.toFixed(2)}</p>
                        {h.price_stale && <p className="text-xs text-yellow-500/70">stale</p>}
                      </div>
                    )}

                    {/* Confidence */}
                    <div>
                      <p className={`text-xs font-bold capitalize ${confidenceColor(h.confidence)}`}>
                        {h.confidence}
                      </p>
                    </div>

                    {/* Mention count badge */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">×</span>
                      <span className="text-sm font-black text-orange-400 font-mono">{h.mention_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-600 text-right">Source: YouTube TTF scraper · refreshes every 60s</p>
    </div>
  )
}
