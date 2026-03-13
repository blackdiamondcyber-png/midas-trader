'use client'

import { useState, useMemo } from 'react'
import type { BacktestRow } from '@/app/api/backtests/route'

type SortKey = keyof Pick<BacktestRow, 'ticker' | 'strategy' | 'return_pct' | 'sharpe' | 'max_dd' | 'win_rate' | 'trades'>
type SortDir = 'asc' | 'desc'

const COLS: { key: SortKey; label: string; fmt: (v: BacktestRow) => string; align?: string }[] = [
  { key: 'ticker', label: 'Ticker', fmt: (r) => r.ticker },
  { key: 'strategy', label: 'Strategy', fmt: (r) => r.strategy },
  {
    key: 'return_pct',
    label: 'Return %',
    fmt: (r) => `${r.return_pct >= 0 ? '+' : ''}${r.return_pct.toFixed(1)}%`,
    align: 'text-right',
  },
  {
    key: 'sharpe',
    label: 'Sharpe',
    fmt: (r) => r.sharpe.toFixed(3),
    align: 'text-right',
  },
  {
    key: 'max_dd',
    label: 'Max DD',
    fmt: (r) => `${r.max_dd.toFixed(1)}%`,
    align: 'text-right',
  },
  {
    key: 'win_rate',
    label: 'Win Rate',
    fmt: (r) => (r.win_rate != null ? `${r.win_rate.toFixed(1)}%` : '—'),
    align: 'text-right',
  },
  {
    key: 'trades',
    label: 'Trades',
    fmt: (r) => (r.trades != null ? String(r.trades) : '—'),
    align: 'text-right',
  },
]

function returnColor(v: number) {
  if (v >= 50) return 'text-green-400 font-semibold'
  if (v >= 20) return 'text-green-400/80'
  if (v >= 0) return 'text-slate-200'
  return 'text-red-400'
}

function sharpeColor(v: number) {
  if (v >= 0.7) return 'text-gold font-semibold'
  if (v >= 0.4) return 'text-yellow-400/80'
  if (v >= 0) return 'text-slate-300'
  return 'text-red-400'
}

function ddColor(v: number) {
  if (v > -10) return 'text-green-400'
  if (v > -20) return 'text-yellow-400'
  return 'text-red-400'
}

function cellColor(col: SortKey, row: BacktestRow): string {
  if (col === 'return_pct') return returnColor(row.return_pct)
  if (col === 'sharpe') return sharpeColor(row.sharpe)
  if (col === 'max_dd') return ddColor(row.max_dd)
  return 'text-slate-200'
}

const BEST_SHARPE_THRESHOLD = 0.7

export default function BacktestTable({ initialRows }: { initialRows: BacktestRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('sharpe')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState('')

  const rows = useMemo(() => {
    let result = initialRows
    if (filter) {
      const q = filter.toLowerCase()
      result = result.filter(
        (r) => r.ticker.toLowerCase().includes(q) || r.strategy.toLowerCase().includes(q) || (r.category ?? '').toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      const av = a[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
      const bv = b[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [initialRows, sortKey, sortDir, filter])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Filter by ticker, strategy, category…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-navy-mid border border-navy-border rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold w-64"
        />
        <span className="text-xs text-slate-500">{rows.length} results</span>
        <div className="ml-auto flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gold inline-block" /> Sharpe ≥ 0.70
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Return ≥ 50%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-border bg-navy">
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`table-header cursor-pointer select-none hover:text-gold transition-colors ${col.align ?? ''}`}
                >
                  <span className="flex items-center gap-1 justify-start">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-gold">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
              <th className="table-header">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isGold = row.sharpe >= BEST_SHARPE_THRESHOLD
              return (
                <tr
                  key={row.id}
                  className={`border-b border-navy-border/50 transition-colors hover:bg-navy-mid/50 ${
                    isGold ? 'bg-gold/5' : i % 2 === 0 ? 'bg-navy-dark/40' : ''
                  }`}
                >
                  {COLS.map((col) => (
                    <td key={col.key} className={`table-cell font-mono ${col.align ?? ''} ${cellColor(col.key, row)}`}>
                      {col.fmt(row)}
                      {col.key === 'ticker' && isGold && (
                        <span className="ml-1 text-gold text-xs">★</span>
                      )}
                    </td>
                  ))}
                  <td className="table-cell text-slate-600 text-xs truncate max-w-32">
                    {row.source.replace(/_\d{8}_\d{4}$/, '')}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLS.length + 1} className="text-center py-8 text-slate-500 text-sm">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
