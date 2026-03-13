import BacktestTable from '@/components/BacktestTable'
import type { BacktestRow } from '@/app/api/backtests/route'

async function getBacktests(): Promise<BacktestRow[]> {
  try {
    // Direct server-side import instead of HTTP fetch (avoids port dependency)
    const fs = await import('fs')
    const path = await import('path')

    const RESULTS_DIR = '/home/nucagent-linux/projects/trading-backtest/results'
    if (!fs.default.existsSync(RESULTS_DIR)) return []

    const files = fs.default.readdirSync(RESULTS_DIR).filter((f: string) => f.endsWith('.json'))
    const allRows: BacktestRow[] = []

    for (const file of files) {
      try {
        const content = fs.default.readFileSync(path.default.join(RESULTS_DIR, file), 'utf-8')
        const data = JSON.parse(content)
        const rows = normalizeFile(data, file)
        allRows.push(...rows)
      } catch {
        // skip
      }
    }

    // Deduplicate: keep highest sharpe per ticker+strategy
    const seen = new Map<string, BacktestRow>()
    for (const row of allRows) {
      const key = `${row.ticker}||${row.strategy}`
      const existing = seen.get(key)
      if (!existing || row.sharpe > existing.sharpe) seen.set(key, row)
    }

    return Array.from(seen.values()).sort((a, b) => b.sharpe - a.sharpe)
  } catch {
    return []
  }
}

type JsonObj = Record<string, unknown>

function normalizeArray(data: JsonObj[], source: string): BacktestRow[] {
  return data
    .filter((item) => typeof item.sharpe === 'number' && typeof (item.return_pct ?? item['Return [%]']) === 'number')
    .map((item) => ({
      id: `${source}-${String(item.ticker ?? item.strategy)}-${Math.random().toString(36).slice(2, 6)}`,
      ticker: typeof item.ticker === 'string' ? item.ticker : 'N/A',
      strategy: typeof item.strategy === 'string' ? item.strategy : source,
      return_pct: (item.return_pct ?? item['Return [%]'] ?? 0) as number,
      buy_hold_pct: typeof (item.bh_pct ?? item.buy_hold_pct) === 'number' ? (item.bh_pct ?? item.buy_hold_pct) as number : null,
      sharpe: item.sharpe as number,
      max_dd: typeof (item.max_dd ?? item.max_drawdown ?? item['Max. Drawdown [%]']) === 'number'
        ? (item.max_dd ?? item.max_drawdown ?? item['Max. Drawdown [%]']) as number
        : 0,
      win_rate: typeof (item.win_rate ?? item['Win Rate [%]']) === 'number' ? (item.win_rate ?? item['Win Rate [%]']) as number : null,
      trades: typeof (item.trades ?? item['# Trades']) === 'number' ? (item.trades ?? item['# Trades']) as number : null,
      category: typeof item.category === 'string' ? item.category : null,
      source,
    }))
}

function normalizeFile(data: unknown, filename: string): BacktestRow[] {
  const source = filename.replace(/\.json$/, '')

  if (Array.isArray(data)) return normalizeArray(data as JsonObj[], source)

  if (typeof data !== 'object' || data === null) return []
  const obj = data as JsonObj

  if (obj.portfolio_return !== undefined && obj.instruments) {
    const rows: BacktestRow[] = []
    for (const [ticker, inst] of Object.entries(obj.instruments as Record<string, Record<string, number>>)) {
      rows.push({
        id: `${source}-${ticker}`,
        ticker,
        strategy: 'PortfolioCombined',
        return_pct: inst.return_pct,
        buy_hold_pct: null,
        sharpe: typeof obj.sharpe === 'number' ? obj.sharpe : 0,
        max_dd: inst.max_dd,
        win_rate: inst.win_rate ?? null,
        trades: inst.trades ?? null,
        category: 'Portfolio',
        source,
      })
    }
    return rows
  }

  if (typeof obj.name === 'string' && typeof obj.return === 'number') {
    return [{
      id: source,
      ticker: obj.name,
      strategy: 'RiskParity',
      return_pct: obj.return,
      buy_hold_pct: null,
      sharpe: typeof obj.sharpe === 'number' ? obj.sharpe : 0,
      max_dd: typeof obj.max_dd === 'number' ? obj.max_dd : 0,
      win_rate: null,
      trades: null,
      category: 'Portfolio',
      source,
    }]
  }

  if (obj.regime_filtered || obj.kohrs_combo) {
    const rows: BacktestRow[] = []
    if (obj.regime_filtered && typeof obj.regime_filtered === 'object') {
      const rf = obj.regime_filtered as JsonObj
      rows.push({
        id: `${source}-regime`,
        ticker: 'SPY',
        strategy: 'RegimeFilteredMomentum',
        return_pct: typeof rf['Return [%]'] === 'number' ? rf['Return [%]'] : 0,
        buy_hold_pct: typeof rf['Buy & Hold Return [%]'] === 'number' ? rf['Buy & Hold Return [%]'] : null,
        sharpe: typeof rf['Sharpe Ratio'] === 'number' ? rf['Sharpe Ratio'] : 0,
        max_dd: typeof rf['Max. Drawdown [%]'] === 'number' ? rf['Max. Drawdown [%]'] : 0,
        win_rate: typeof rf['Win Rate [%]'] === 'number' ? rf['Win Rate [%]'] : null,
        trades: typeof rf['# Trades'] === 'number' ? rf['# Trades'] : null,
        category: 'Optimized',
        source,
      })
    }
    if (Array.isArray(obj.kohrs_combo)) rows.push(...normalizeArray(obj.kohrs_combo as JsonObj[], source))
    return rows
  }

  return []
}

export default async function BacktestsPage() {
  const rows = await getBacktests()

  const bestSharpe = rows.reduce((best, r) => (r.sharpe > best.sharpe ? r : best), rows[0])
  const bestReturn = rows.reduce((best, r) => (r.return_pct > best.return_pct ? r : best), rows[0])
  const avgSharpe = rows.reduce((s, r) => s + r.sharpe, 0) / (rows.length || 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Backtest Results</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          All strategies across all instruments · {rows.length} configurations
        </p>
      </div>

      {/* Summary Cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card border-gold/30 bg-gold/5">
            <p className="label">Best Sharpe Ratio</p>
            <p className="text-2xl font-black text-gold mt-1">{bestSharpe?.sharpe.toFixed(3)}</p>
            <p className="text-sm text-slate-400 mt-1">
              {bestSharpe?.ticker} · {bestSharpe?.strategy}
            </p>
          </div>
          <div className="card">
            <p className="label">Best Return</p>
            <p className="text-2xl font-black text-green-400 mt-1">
              +{bestReturn?.return_pct.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {bestReturn?.ticker} · {bestReturn?.strategy}
            </p>
          </div>
          <div className="card">
            <p className="label">Avg Sharpe (All)</p>
            <p className="text-2xl font-black text-slate-200 mt-1">{avgSharpe.toFixed(3)}</p>
            <p className="text-sm text-slate-400 mt-1">{rows.length} strategy configurations</p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-lg">No backtest results found</p>
          <p className="text-slate-600 text-sm mt-2">
            Expected JSON files in /home/nucagent-linux/projects/trading-backtest/results/
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-border">
            <h2 className="font-semibold text-white">All Results</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ★ = Sharpe ≥ 0.70 · Click column headers to sort
            </p>
          </div>
          <div className="p-5">
            <BacktestTable initialRows={rows} />
          </div>
        </div>
      )}
    </div>
  )
}
