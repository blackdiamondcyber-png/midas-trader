import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const RESULTS_DIR = '/home/nucagent-linux/projects/trading-backtest/results'

export interface BacktestRow {
  id: string
  ticker: string
  strategy: string
  return_pct: number
  buy_hold_pct: number | null
  sharpe: number
  max_dd: number
  win_rate: number | null
  trades: number | null
  category: string | null
  source: string
}

type JsonObj = Record<string, unknown>

function normalizeArray(data: JsonObj[], source: string): BacktestRow[] {
  const rows: BacktestRow[] = []
  for (const item of data) {
    if (typeof item.sharpe !== 'number') continue
    const returnVal = item.return_pct ?? item['Return [%]']
    if (typeof returnVal !== 'number') continue

    rows.push({
      id: `${source}-${String(item.ticker ?? item.strategy)}-${Math.random().toString(36).slice(2, 7)}`,
      ticker: typeof item.ticker === 'string' ? item.ticker : 'N/A',
      strategy: typeof item.strategy === 'string' ? item.strategy : source,
      return_pct: returnVal,
      buy_hold_pct: typeof (item.bh_pct ?? item.buy_hold_pct) === 'number' ? (item.bh_pct ?? item.buy_hold_pct) as number : null,
      sharpe: item.sharpe,
      max_dd: typeof (item.max_dd ?? item.max_drawdown ?? item['Max. Drawdown [%]']) === 'number'
        ? (item.max_dd ?? item.max_drawdown ?? item['Max. Drawdown [%]']) as number
        : 0,
      win_rate: typeof (item.win_rate ?? item['Win Rate [%]']) === 'number' ? (item.win_rate ?? item['Win Rate [%]']) as number : null,
      trades: typeof (item.trades ?? item['# Trades']) === 'number' ? (item.trades ?? item['# Trades']) as number : null,
      category: typeof item.category === 'string' ? item.category : null,
      source,
    })
  }
  return rows
}

function normalizeFile(data: unknown, filename: string): BacktestRow[] {
  const source = filename.replace(/\.json$/, '')

  if (Array.isArray(data)) {
    return normalizeArray(data as JsonObj[], source)
  }

  if (typeof data !== 'object' || data === null) return []
  const obj = data as JsonObj

  // Portfolio combined: { portfolio_return, instruments: { TICKER: { ... } } }
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

  // Risk parity: { name, return, max_dd, sharpe, weights }
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

  // Optimized nested: { regime_filtered: { ... }, kohrs_combo: [...] }
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
    if (Array.isArray(obj.kohrs_combo)) {
      rows.push(...normalizeArray(obj.kohrs_combo as JsonObj[], source))
    }
    return rows
  }

  return []
}

export async function GET() {
  try {
    if (!fs.existsSync(RESULTS_DIR)) {
      return NextResponse.json({ error: 'Results directory not found', rows: [] }, { status: 200 })
    }

    const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'))
    const allRows: BacktestRow[] = []

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf-8')
        const data = JSON.parse(content)
        const rows = normalizeFile(data, file)
        allRows.push(...rows)
      } catch {
        // skip malformed files
      }
    }

    // Deduplicate: if same ticker+strategy appears across multiple files, keep the one with highest sharpe
    const seen = new Map<string, BacktestRow>()
    for (const row of allRows) {
      const key = `${row.ticker}||${row.strategy}`
      const existing = seen.get(key)
      if (!existing || row.sharpe > existing.sharpe) {
        seen.set(key, row)
      }
    }

    const rows = Array.from(seen.values()).sort((a, b) => b.sharpe - a.sharpe)
    return NextResponse.json({ rows })
  } catch (err) {
    return NextResponse.json({ error: String(err), rows: [] }, { status: 500 })
  }
}
