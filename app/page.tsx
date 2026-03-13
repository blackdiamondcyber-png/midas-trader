'use client'

import { useState, useEffect } from 'react'
import MarketCloseTimer from '@/components/MarketCloseTimer'

type Signal = 'LONG' | 'STAND_BY' | 'BEAR'

interface MarketData {
  price: number
  ma7: number
  ma23: number
  ma200: number
  vix: number
  signal: Signal
  lastUpdated: string
  position?: {
    status: string
    direction: string
    entry: number
    stop: number
    target: number
    pnl: number
    pnlPct: number
    entryDate: string
    ticker: string
  } | null
}

const VIX_THRESHOLD = 28

const SIGNAL_CONFIG: Record<Signal, { label: string; color: string; bg: string; border: string; glow: string }> = {
  LONG: {
    label: 'LONG',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    glow: 'shadow-green-500/20',
  },
  STAND_BY: {
    label: 'STAND BY',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    glow: 'shadow-yellow-500/20',
  },
  BEAR: {
    label: 'BEAR',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    glow: 'shadow-red-500/20',
  },
}

export default function Dashboard() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignal = () => {
      fetch('/api/signal')
        .then(r => r.json())
        .then(d => {
          if (d.error) {
            setError(d.error)
          } else {
            setData(d)
            setError(null)
          }
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
    fetchSignal()
    const interval = setInterval(fetchSignal, 15000)
    return () => clearInterval(interval)
  }, [])

  const signal: Signal = (data?.signal as Signal) || 'STAND_BY'
  const cfg = SIGNAL_CONFIG[signal]
  const pos = data?.position

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategy Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">VIXRegimeStrategy · SPY · 7/23/200 MA</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last Updated</p>
          <p className="text-sm text-slate-300 font-mono">
            {loading ? '...' : data?.lastUpdated || '--'}
          </p>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
      </div>

      {/* Top row: Signal + Timer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`md:col-span-2 card ${cfg.bg} border ${cfg.border} shadow-lg ${cfg.glow}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="label">Current Signal</span>
              <div className={`text-7xl font-black tracking-tight mt-2 ${cfg.color}`}>
                {loading ? '...' : cfg.label}
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {signal === 'LONG' && 'Trend confirmed · VIX below threshold · All MAs aligned'}
                {signal === 'STAND_BY' && 'MA cross not confirmed · Waiting for entry signal'}
                {signal === 'BEAR' && `VIX elevated (${data?.vix ?? '--'}) · No new longs`}
              </p>
            </div>
            <div className={`text-9xl opacity-10 select-none ${cfg.color}`}>
              {signal === 'LONG' ? '↑' : signal === 'BEAR' ? '↓' : '—'}
            </div>
          </div>
        </div>
        <MarketCloseTimer />
      </div>

      {/* Paper Position */}
      {pos && (
        <div className="card border-2 border-green-500/40 bg-green-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                IN TRADE
              </span>
              <span className="text-sm text-slate-400">{pos.direction} {pos.ticker}</span>
            </div>
            <span className="text-xs text-slate-500">Entry: {pos.entryDate}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Entry</p>
              <p className="font-mono text-sm text-white">${pos.entry?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Stop</p>
              <p className="font-mono text-sm text-red-400">${pos.stop?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Target</p>
              <p className="font-mono text-sm text-green-400">${pos.target?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">P&L</p>
              <p className={`font-mono text-sm font-bold ${(pos.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(pos.pnl ?? 0) >= 0 ? '+' : ''}{pos.pnlPct?.toFixed(2)}% (${pos.pnl?.toFixed(0)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No position — show watching state */}
      {!pos && data && !loading && (
        <div className="card border border-navy-border bg-navy-mid/30">
          <div className="flex items-center gap-3">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              WATCHING
            </span>
            <span className="text-sm text-slate-400">
              SPY ${data.price?.toFixed(2)} · Gap to signal: {data.price > data.ma200 ? 'Above 200MA' : `${(data.ma200 - data.price).toFixed(2)} below 200MA`}
            </span>
          </div>
        </div>
      )}

      {/* Market Inputs */}
      {data && (
        <div className="card">
          <h2 className="label mb-4">Current Market Inputs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricBox label="SPY Price" value={`$${data.price.toFixed(2)}`} />
            <MetricBox
              label="7-Day MA"
              value={`$${data.ma7.toFixed(2)}`}
              sub={`${data.price > data.ma7 ? '▲' : '▼'} ${Math.abs(data.price - data.ma7).toFixed(2)}`}
              subColor={data.price > data.ma7 ? 'text-green-400' : 'text-red-400'}
            />
            <MetricBox
              label="23-Day MA"
              value={`$${data.ma23.toFixed(2)}`}
              sub={`${data.ma7 > data.ma23 ? '▲ Bull Cross' : '▼ Bear Cross'}`}
              subColor={data.ma7 > data.ma23 ? 'text-green-400' : 'text-red-400'}
            />
            <MetricBox
              label="200-Day MA"
              value={`$${data.ma200.toFixed(2)}`}
              sub={`${data.price > data.ma200 ? '▲ Bull Regime' : '▼ Bear Regime'}`}
              subColor={data.price > data.ma200 ? 'text-green-400' : 'text-red-400'}
            />
            <MetricBox
              label="VIX"
              value={data.vix.toFixed(2)}
              sub={data.vix < VIX_THRESHOLD ? `✓ Below ${VIX_THRESHOLD} threshold` : `✗ Above ${VIX_THRESHOLD} — no longs`}
              subColor={data.vix < VIX_THRESHOLD ? 'text-green-400' : 'text-red-400'}
              highlight={data.vix >= VIX_THRESHOLD}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-navy-border">
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Entry rule: SPY &gt; 7MA &gt; 23MA &gt; 200MA</span>
              <span>VIX filter: &lt; {VIX_THRESHOLD}</span>
              <span>Stop: 1.8× ATR</span>
              <span>Target: 5.0× ATR</span>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Stats */}
      <div className="card">
        <h2 className="label mb-4">VIXRegimeStrategy · Backtest Summary (SPY)</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Total Return" value="91.3%" positive />
          <StatBox label="Sharpe Ratio" value="0.753" />
          <StatBox label="Max Drawdown" value="-8.5%" negative />
          <StatBox label="Win Rate" value="48.5%" />
          <StatBox label="Total Trades" value="33" />
          <StatBox label="vs Buy & Hold" value="-209%" note="(B&H: +300%)" negative />
        </div>
        <p className="text-xs text-slate-600 mt-4">Period: 2015–2026 · Capital: $100K · Commission: 0.1%</p>
      </div>
    </div>
  )
}

function MetricBox({
  label,
  value,
  sub,
  subColor = 'text-slate-500',
  highlight = false,
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-3 border ${highlight ? 'bg-red-500/10 border-red-500/30' : 'bg-navy-mid border-navy-border'}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-base font-bold font-mono text-white">{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>}
    </div>
  )
}

function StatBox({
  label,
  value,
  positive,
  negative,
  note,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
  note?: string
}) {
  const color = positive ? 'text-green-400' : negative ? 'text-red-400' : 'text-gold'
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {note && <p className="text-xs text-slate-600">{note}</p>}
    </div>
  )
}
