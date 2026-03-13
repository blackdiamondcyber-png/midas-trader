type Compatibility = 'HIGH' | 'MEDIUM' | 'LOW'

interface PropFirm {
  name: string
  monthlyCost: string
  accountSize: string
  profitTarget: string
  maxDailyDD: string
  maxTotalDD: string
  ddType: string
  payout: string
  overnight: string
  compatibility: Compatibility
  compatibilityScore: number
  notes: string[]
  pros: string[]
  cons: string[]
}

const FIRMS: PropFirm[] = [
  {
    name: 'Topstep $50K Futures',
    monthlyCost: '$165/mo',
    accountSize: '$50,000',
    profitTarget: '$3,000',
    maxDailyDD: 'None',
    maxTotalDD: '$3,000',
    ddType: 'Trailing from high',
    payout: '90% after first $10K',
    overnight: 'Yes',
    compatibility: 'HIGH',
    compatibilityScore: 90,
    notes: [
      'Swing trading allowed — positions can be held overnight and multi-day',
      'No daily loss limit — strategy can absorb normal losing days',
      '$3K trailing drawdown from equity high is manageable with proper sizing',
      '90% payout after first $10K is competitive',
    ],
    pros: [
      'No daily loss limit',
      'Overnight holding allowed',
      '90% payout (after $10K)',
      'Well-established firm, strong reputation',
    ],
    cons: [
      'Trailing drawdown from equity high — early profits raise the bar',
      '$3K total DD is tighter than strategy historical -8.5% on full capital',
      'First $10K at lower payout split',
    ],
  },
  {
    name: 'Topstep $100K Futures',
    monthlyCost: '$375/mo',
    accountSize: '$100,000',
    profitTarget: '$6,000',
    maxDailyDD: 'None',
    maxTotalDD: '$3,000',
    ddType: 'Trailing from high',
    payout: '90% after first $10K',
    overnight: 'Yes',
    compatibility: 'HIGH',
    compatibilityScore: 85,
    notes: [
      'Same rules as $50K but double account size and profit target',
      'Same $3K trailing DD on $100K means tighter relative buffer (3% vs 6%)',
      'Higher monthly cost — only worth it if strategy consistently clears $6K',
      'Better for scaling after proving the strategy on $50K first',
    ],
    pros: [
      'Larger account — more position sizing flexibility',
      'No daily loss limit',
      'Overnight holding allowed',
      '90% payout (after $10K)',
    ],
    cons: [
      '$375/mo is steep for evaluation phase',
      '$3K DD on $100K is only 3% relative buffer',
      '$6K target requires more time or aggressive sizing',
    ],
  },
  {
    name: 'LucidFlex $50K',
    monthlyCost: '$97/mo',
    accountSize: '$50,000',
    profitTarget: '$3,000',
    maxDailyDD: '$1,000',
    maxTotalDD: '$2,000',
    ddType: 'EOD (end-of-day)',
    payout: '80%',
    overnight: 'Yes',
    compatibility: 'MEDIUM',
    compatibilityScore: 58,
    notes: [
      'Cheapest evaluation at $97/mo — good for testing the waters',
      '$1K daily loss limit constrains normal losing days',
      '$2K EOD drawdown is very tight — requires halving position sizes',
      'EOD-based DD is more forgiving than real-time trailing',
    ],
    pros: [
      'Lowest monthly cost ($97)',
      'Overnight holding allowed',
      'EOD drawdown is less punishing than real-time trailing',
      'Low profit target ($3K)',
    ],
    cons: [
      '$1K daily loss limit constrains the strategy',
      '$2K total DD requires cutting position sizes significantly',
      '80% payout — 10% less than Topstep/Apex',
    ],
  },
  {
    name: 'Apex $50K',
    monthlyCost: '$137/mo',
    accountSize: '$50,000',
    profitTarget: '$3,000',
    maxDailyDD: 'None',
    maxTotalDD: '$2,500',
    ddType: 'Trailing from high',
    payout: '100% first $25K, then 90%',
    overnight: 'ES only',
    compatibility: 'HIGH',
    compatibilityScore: 88,
    notes: [
      '100% payout on first $25K — best payout structure for initial profits',
      'No daily loss limit — strategy can absorb normal drawdown days',
      'Overnight holding limited to ES contracts (our primary instrument)',
      '$2.5K trailing DD is tight but manageable with 1-contract sizing',
    ],
    pros: [
      '100% payout on first $25K withdrawn',
      'No daily loss limit',
      'ES overnight allowed (our primary instrument)',
      'Mid-range monthly cost ($137)',
    ],
    cons: [
      '$2.5K trailing DD is the tightest in the group',
      'Overnight limited to ES only — no diversification',
      'Payout drops to 90% after $25K',
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
          Compatibility scored against VIXRegimeStrategy · ES futures · swing trading · ATR stops
        </p>
      </div>

      {/* Why Our Strategy Fits */}
      <div className="card border-gold/40 bg-gold/5 space-y-4">
        <h2 className="font-bold text-gold text-lg">Why Our Strategy Fits Prop Firms</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-xs text-slate-500">Total Return</p>
            <p className="text-green-400 font-bold text-lg">91.3%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Sharpe Ratio</p>
            <p className="text-gold font-bold text-lg">0.753</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max Drawdown</p>
            <p className="text-red-400 font-bold text-lg">-8.5%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Trades/Year</p>
            <p className="text-white font-bold text-lg">~3</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Win Rate</p>
            <p className="text-green-400 font-bold text-lg">48.5%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max Consec. Losses</p>
            <p className="text-yellow-400 font-bold text-lg">2–3</p>
          </div>
        </div>
        <div className="border-t border-gold/20 pt-3 space-y-2">
          <p className="text-sm text-slate-300 leading-relaxed">
            VIXRegimeStrategy is a <span className="text-white font-medium">low-frequency swing strategy</span> that
            trades ES futures using 7/23/200 MA alignment with a VIX regime filter. With only ~3 trades
            per year and controlled drawdowns, it naturally fits prop firm rules that penalize overtrading
            and excessive drawdowns.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            The strategy uses 1.8x ATR stops and 5.0x ATR targets, giving a favorable risk/reward profile.
            Position sizing at 1 ES contract on a $50K account keeps risk per trade under 2%, well within
            most prop firm daily and trailing drawdown limits.
          </p>
        </div>
      </div>

      {/* Strategy profile */}
      <div className="card bg-navy-mid border-navy-border">
        <h2 className="label mb-3">VIXRegimeStrategy Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Style</p>
            <p className="text-white font-medium">Swing Trading (ES)</p>
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
          Key requirements: <span className="text-white">overnight holding</span> ·
          <span className="text-white"> no tight daily DD limit</span> ·
          low trade frequency (~3 trades/year on SPY, more on ES with same signals)
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
                <th className="table-header w-44">Firm</th>
                <th className="table-header text-right">Monthly</th>
                <th className="table-header text-right">Account</th>
                <th className="table-header text-right">Target</th>
                <th className="table-header text-right">Daily DD</th>
                <th className="table-header text-right">Total DD</th>
                <th className="table-header">Payout</th>
                <th className="table-header">Overnight</th>
                <th className="table-header text-center">Fit</th>
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
                    <td className={`table-cell text-right font-mono ${firm.maxDailyDD === 'None' ? 'text-green-400' : 'text-red-400/80'}`}>
                      {firm.maxDailyDD === 'None' ? '✓ None' : firm.maxDailyDD}
                    </td>
                    <td className="table-cell text-right font-mono text-red-400/80">
                      <span>{firm.maxTotalDD}</span>
                      <span className="text-xs text-slate-500 ml-1">({firm.ddType})</span>
                    </td>
                    <td className="table-cell font-mono text-green-400 text-xs">{firm.payout}</td>
                    <td className={`table-cell ${firm.overnight === 'Yes' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {firm.overnight === 'Yes' ? '✓ Yes' : firm.overnight}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FIRMS.map((firm) => {
          const cfg = COMPAT_CONFIG[firm.compatibility]
          return (
            <div key={firm.name} className={`card border ${cfg.border} ${cfg.bg} space-y-4`}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{firm.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{firm.monthlyCost} · {firm.accountSize} · {firm.ddType}</p>
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
          <span className="text-white font-semibold">Start with Topstep $50K or Apex $50K.</span> Both allow
          overnight holding with no daily loss limit — the two non-negotiable requirements for VIXRegimeStrategy.
          Topstep has a slightly larger $3K trailing DD buffer; Apex offers 100% payout on the first $25K.
        </p>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          LucidFlex is the cheapest entry at $97/mo but its $1K daily limit and $2K total DD require
          cutting position size in half, reducing expected returns proportionally. Save it for a second
          simultaneous evaluation if the first account passes.
        </p>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Topstep $100K is best reserved for after proving the strategy on a $50K account — the
          $375/mo cost and same $3K DD on double capital makes it a tighter relative margin.
        </p>
      </div>
    </div>
  )
}
