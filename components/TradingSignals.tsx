'use client'

import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/trading'

interface HealthData {
  status: string
  ws_connected: boolean
  last_scrape: string
  paper_mode: boolean
  timestamp: string
}

interface PriceData {
  ticker: string
  price: number
  bid: number | null
  ask: number | null
  last_updated: string
  source: string
  stale: boolean
}

interface IronCondorSetup {
  underlying: string
  underlying_price: number
  expiry_date: string
  dte: number
  short_put: number
  long_put: number
  short_call: number
  long_call: number
  wing_width: number
  max_credit_estimate: number
  max_risk: number
  position_size: number
  notes: string
}

interface StrategySignal {
  action: string
  reason: string
  setups?: IronCondorSetup[]
  vix_level: number
  options_available: boolean
  evaluated_at: string
}

interface StrategyData {
  regime: string
  active_strategy: string
  vix_level: number
  reason: string
  signal: StrategySignal
  evaluated_at: string
}

type RegimeKey = 'bull_low_vol' | 'choppy_elevated_vol' | 'high_fear' | string

const REGIME_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  bull_low_vol: {
    label: 'BULL / LOW VOL',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    dot: 'bg-green-400',
  },
  choppy_elevated_vol: {
    label: 'CHOPPY / ELEVATED VOL',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    dot: 'bg-yellow-400',
  },
  high_fear: {
    label: 'HIGH FEAR',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    dot: 'bg-red-400',
  },
}

function getRegimeCfg(regime: string) {
  const key = regime?.toLowerCase()
  return REGIME_CONFIG[key] ?? {
    label: regime?.toUpperCase() ?? 'UNKNOWN',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/40',
    dot: 'bg-slate-400',
  }
}

export default function TradingSignals() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [prices, setPrices] = useState<{ SPY: PriceData | null; QQQ: PriceData | null }>({ SPY: null, QQQ: null })
  const [strategy, setStrategy] = useState<StrategyData | null>(null)
  const [vixInput, setVixInput] = useState<string>('25.5')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  const fetchAll = useCallback(async () => {
    try {
      const vix = parseFloat(vixInput) || 25.5

      const [healthRes, spyRes, qqqRes, stratRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/prices/SPY`),
        fetch(`${API_BASE}/prices/QQQ`),
        fetch(`${API_BASE}/strategies/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: 'SPY', vix_level: vix }),
        }),
      ])

      const [healthData, spyData, qqqData, stratData] = await Promise.all([
        healthRes.json(),
        spyRes.json(),
        qqqRes.json(),
        stratRes.json(),
      ])

      setHealth(healthData)
      setPrices({ SPY: spyData, QQQ: qqqData })
      setStrategy(stratData)
      setError(null)
      setLastRefresh(new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour12: true }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [vixInput])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const regime = strategy?.regime ?? ''
  const cfg = getRegimeCfg(regime)
  const setups = strategy?.signal?.setups ?? []
  const isIronCondor = strategy?.active_strategy === 'IronCondorStrategy'

  return (
    <div className="space-y-4">
      {/* Header Row: Status + Paper Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Trading Signals</h2>
          {/* Backend status dot */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                health?.ws_connected ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-red-400'
              }`}
            />
            <span className="text-xs text-slate-500">
              {health?.ws_connected ? 'Live' : 'Offline'}
            </span>
          </div>
          {/* Paper mode badge */}
          {health?.paper_mode && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 tracking-wide">
              PAPER
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            Refreshes every 30s · Last: {lastRefresh || '—'}
          </p>
          {error && <p className="text-xs text-red-400 mt-0.5">⚠ {error}</p>}
        </div>
      </div>

      {/* Live Price Strip */}
      <div className="grid grid-cols-2 gap-3">
        {(['SPY', 'QQQ'] as const).map((ticker) => {
          const p = prices[ticker]
          return (
            <div
              key={ticker}
              className="rounded-lg border border-gray-700 bg-gray-900/50 backdrop-blur px-4 py-3 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-400 tracking-widest">{ticker}</span>
                <div className="text-xl font-black font-mono text-white mt-0.5">
                  {loading ? '—' : p ? `$${p.price.toFixed(2)}` : '—'}
                </div>
              </div>
              <div className="text-right">
                {p?.stale && (
                  <span className="text-xs text-yellow-500/80">stale</span>
                )}
                {p && !p.stale && (
                  <span className="text-xs text-green-400">live</span>
                )}
                {p?.bid && p?.ask && (
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    {p.bid.toFixed(2)} / {p.ask.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Regime Badge + Strategy */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} backdrop-blur px-5 py-4`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className={`inline-block w-3 h-3 rounded-full ${cfg.dot}`} />
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Market Regime</p>
              <p className={`text-base font-black tracking-wide ${cfg.color}`}>
                {loading ? '…' : cfg.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Active Strategy</p>
            <p className="text-sm font-bold text-white">
              {loading ? '…' : strategy?.active_strategy ?? '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">VIX Level</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="10"
                max="80"
                value={vixInput}
                onChange={(e) => setVixInput(e.target.value)}
                onBlur={fetchAll}
                className="w-20 bg-gray-900/70 border border-gray-700 rounded px-2 py-1 text-sm font-mono text-white text-right focus:outline-none focus:border-orange-500/60"
              />
              <span className="text-xs text-slate-500">VIX</span>
            </div>
          </div>
        </div>
        {strategy?.reason && (
          <p className="text-xs text-slate-400 mt-3 border-t border-white/10 pt-3">
            {strategy.reason}
          </p>
        )}
      </div>

      {/* Iron Condor Setup Card */}
      {isIronCondor && setups.length > 0 && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 backdrop-blur px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-orange-400 tracking-wide">⚡ IRON CONDOR SETUPS</h3>
            <span className="text-xs text-slate-500">
              Expiry: {setups[0]?.expiry_date} ({setups[0]?.dte} DTE)
            </span>
          </div>

          <div className="space-y-4">
            {setups.map((setup) => (
              <div key={setup.underlying} className="rounded-lg border border-gray-700 bg-gray-900/50 overflow-hidden">
                {/* Setup header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/60 border-b border-gray-700">
                  <span className="text-sm font-bold text-white">{setup.underlying}</span>
                  <span className="text-xs text-slate-400 font-mono">@ ${setup.underlying_price.toFixed(2)}</span>
                </div>

                {/* Strikes table */}
                <div className="grid grid-cols-4 divide-x divide-gray-700">
                  {[
                    { label: 'Long Put', value: setup.long_put, color: 'text-red-400' },
                    { label: 'Short Put', value: setup.short_put, color: 'text-orange-400' },
                    { label: 'Short Call', value: setup.short_call, color: 'text-orange-400' },
                    { label: 'Long Call', value: setup.long_call, color: 'text-red-400' },
                  ].map((s) => (
                    <div key={s.label} className="px-3 py-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`text-base font-black font-mono ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Credit / Risk */}
                <div className="grid grid-cols-3 divide-x divide-gray-700 border-t border-gray-700">
                  <div className="px-3 py-2 text-center">
                    <p className="text-xs text-slate-500">Est. Credit</p>
                    <p className="text-sm font-bold text-green-400 font-mono">${setup.max_credit_estimate.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-xs text-slate-500">Max Risk</p>
                    <p className="text-sm font-bold text-red-400 font-mono">${setup.max_risk.toFixed(2)}</p>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <p className="text-xs text-slate-500">Size</p>
                    <p className="text-sm font-bold text-white font-mono">{setup.position_size}x</p>
                  </div>
                </div>

                {/* Notes */}
                {setup.notes && (
                  <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/30">
                    <p className="text-xs text-slate-500">{setup.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Options unavailable notice */}
          {!strategy?.signal?.options_available && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2">
              <p className="text-xs text-yellow-400">
                ⚠ Options trading not enabled on this account. Setups calculated but NOT submitted.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
