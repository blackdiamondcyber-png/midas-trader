type Compatibility = 'HIGH' | 'MEDIUM' | 'LOW'

interface PropFirm {
  name: string
  monthlyCost: string
  accountSize: string
  profitTarget: string
  maxDailyDD: string
  maxTotalDD: string
  payout: string
  eodRule: string
  compatibility: Compatibility
  compatibilityScore: number
  notes: string[]
  pros: string[]
  cons: string[]
}

const FIRMS: PropFirm[] = [
  {
    name: 'Apex Trader Funding',
    monthlyCost: '$147/mo',
    accountSize: '$50,000',
    profitTarget: '6% ($3,000)',
    maxDailyDD: '2% ($1,000)',
    maxTotalDD: '6% ($3,000)',
    payout: '90%',
    eodRule: 'None',
    compatibility: 'HIGH',
    compatibilityScore: 92,
    notes: [
      'Swing trading allowed — positions can be held overnight and multi-day',
      'No EOD close requirement — VIXRegimeStrategy holds average 24 days',
      'Consistent drawdown performance: strategy max DD -8.5% fits within account limits',
      '90% payout is best-in-class',
    ],
    pros: [
      'No EOD close rule (swing trading compatible)',
      'Highest payout at 90%',
      'Reasonable profit target (6%)',
      'Multiple account sizes available',
    ],
    cons: [
      '6% total drawdown is tight — strategy hit -8.5% historically (on full capital)',
      'Monthly reset on evaluation accounts',
    ],
  },
  {
    name: 'Topstep',
    monthlyCost: '$165/mo',
    accountSize: '$50,000',
    profitTarget: '10% ($5,000)',
    maxDailyDD: '3% ($1,500)',
    maxTotalDD: '8% ($4,000)',
    payout: '90%',
    eodRule: 'Positions must close by 3:55 PM ET',
    compatibility: 'LOW',
    compatibilityScore: 28,
    notes: [
      'EOD close rule is INCOMPATIBLE with VIXRegimeStrategy',
      'Strategy averages 24-day hold duration — impossible with daily close requirement',
      'Higher profit target (10%) harder to hit with swing-frequency trades',
      'Would require fundamental strategy redesign to intraday',
    ],
    pros: [
      '90% payout matches Apex',
      'Larger total drawdown buffer (8%)',
      'Well-established firm with strong reputation',
    ],
    cons: [
      'EOD close rule makes VIXRegimeStrategy non-viable as-is',
      'Highest monthly cost',
      'Intraday-only constraint defeats the strategy edge',
    ],
  },
  {
    name: 'LucidFlex',
    monthlyCost: '$125/mo',
    accountSize: '$50,000',
    profitTarget: '8% ($4,000)',
    maxDailyDD: '2% ($1,000)',
    maxTotalDD: '5% ($2,500)',
    payout: '80%',
    eodRule: 'None',
    compatibility: 'MEDIUM',
    compatibilityScore: 61,
    notes: [
      'No EOD rule — swing trading is allowed, strategy can run as designed',
      'Tightest total drawdown at 5% — strategy historically hit -8.5%, requires position sizing adjustment',
      '80% payout is 10% lower than competitors',
      'Lowest monthly cost makes it good for evaluation testing',
    ],
    pros: [
      'No EOD close rule',
      'Lowest monthly cost ($125)',
      'Flexible account management',
    ],
    cons: [
      '5% total DD limit is very tight — requires halving position sizes',
      'Lower 80% payout vs competitors',
      '8% profit target requires more trades to achieve',
    ],
  },
]

const COMPAT_CONFIG: Record<Compatibility, { label: string; color: string; bg: string; border: string; bar: string }> = {
  HIGH: {
    label: 'HIGH',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    bar: 'bg-green-500',
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    bar: 'bg-yellow-400',
  },
  LOW: {
    label: 'LOW',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    bar: 'bg-red-500',
  },
}

export default function PropFirmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prop Firm Comparison</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Compatibility scored against VIXRegimeStrategy · swing trading · 7/23 MA · ATR stops
        </p>
      </div>

      {/* Strategy reminder */}
      <div className="card bg-navy-mid border-navy-border">
        <h2 className="label mb-3">VIXRegimeStrategy Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Style</p>
            <p className="text-white font-medium">Swing Trading</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Avg Hold Duration</p>
            <p className="text-white font-medium">24 days</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Historical Max DD</p>
            <p className="text-red-400 font-medium">-8.5%</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Win Rate</p>
            <p className="text-gold font-medium">48.5%</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Key requirement: <span className="text-white">no EOD close rule</span> ·
          positions held overnight and multi-day · low trade frequency (33 trades / 11 years on SPY)
        </p>
      </div>

      {/* Comparison Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-border">
          <h2 className="font-semibold text-white">Side-by-Side Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-border bg-navy">
                <th className="table-header w-36">Firm</th>
                <th className="table-header text-right">Monthly Cost</th>
                <th className="table-header text-right">Account Size</th>
                <th className="table-header text-right">Profit Target</th>
                <th className="table-header text-right">Daily DD Limit</th>
                <th className="table-header text-right">Total DD Limit</th>
                <th className="table-header text-right">Payout</th>
                <th className="table-header">EOD Rule</th>
                <th className="table-header text-center">Compatibility</th>
              </tr>
            </thead>
            <tbody>
              {FIRMS.map((firm, i) => {
                const cfg = COMPAT_CONFIG[firm.compatibility]
                return (
                  <tr
                    key={firm.name}
                    className={`border-b border-navy-border/50 hover:bg-navy-mid/50 transition-colors ${
                      i % 2 === 0 ? 'bg-navy-dark/40' : ''
                    }`}
                  >
                    <td className="table-cell font-semibold text-white">{firm.name}</td>
                    <td className="table-cell text-right font-mono">{firm.monthlyCost}</td>
                    <td className="table-cell text-right font-mono">{firm.accountSize}</td>
                    <td className="table-cell text-right font-mono text-slate-300">{firm.profitTarget}</td>
                    <td className="table-cell text-right font-mono text-red-400/80">{firm.maxDailyDD}</td>
                    <td className="table-cell text-right font-mono text-red-400/80">{firm.maxTotalDD}</td>
                    <td className="table-cell text-right font-mono text-green-400">{firm.payout}</td>
                    <td className={`table-cell ${firm.eodRule === 'None' ? 'text-green-400' : 'text-red-400'}`}>
                      {firm.eodRule === 'None' ? '✓ None' : `✗ ${firm.eodRule}`}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {FIRMS.map((firm) => {
          const cfg = COMPAT_CONFIG[firm.compatibility]
          return (
            <div key={firm.name} className={`card border ${cfg.border} ${cfg.bg} space-y-4`}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{firm.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{firm.monthlyCost} · {firm.accountSize}</p>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded border ${cfg.color} ${cfg.border} bg-navy-dark`}>
                  {cfg.label}
                </span>
              </div>

              {/* Compatibility Score Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Strategy Compatibility</span>
                  <span className={`font-bold ${cfg.color}`}>{firm.compatibilityScore}%</span>
                </div>
                <div className="h-2 bg-navy-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cfg.bar}`}
                    style={{ width: `${firm.compatibilityScore}%` }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="label mb-2">VIXRegimeStrategy Fit</p>
                <ul className="space-y-1.5">
                  {firm.notes.map((note) => (
                    <li key={note} className="text-xs text-slate-400 flex gap-1.5">
                      <span className="mt-0.5 shrink-0">·</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros / Cons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-border">
                <div>
                  <p className="text-xs text-green-400 font-semibold mb-1.5">Pros</p>
                  <ul className="space-y-1">
                    {firm.pros.map((p) => (
                      <li key={p} className="text-xs text-slate-400 flex gap-1">
                        <span className="text-green-500 shrink-0">+</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-semibold mb-1.5">Cons</p>
                  <ul className="space-y-1">
                    {firm.cons.map((c) => (
                      <li key={c} className="text-xs text-slate-400 flex gap-1">
                        <span className="text-red-500 shrink-0">−</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendation */}
      <div className="card border-gold/40 bg-gold/5">
        <h2 className="font-bold text-gold text-lg mb-3">Recommendation</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          <span className="text-white font-semibold">Apex Trader Funding</span> is the best fit for
          VIXRegimeStrategy. Its no-EOD rule is non-negotiable for swing trading — Topstep&apos;s 3:55 PM
          close requirement fundamentally breaks multi-day hold logic. LucidFlex is viable but the
          5% total drawdown buffer is dangerously tight given the strategy&apos;s historical -8.5% max
          drawdown; position sizing would need to be halved, reducing returns proportionally.
        </p>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Before going live on Apex: verify that the 6% trailing drawdown resets correctly, and
          consider running the strategy on a smaller $25K evaluation account first to validate
          live fills match backtest assumptions.
        </p>
      </div>
    </div>
  )
}
