import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'

const PYTHON_SCRIPT = `
import yfinance as yf, json, sys
try:
    spy = yf.download('SPY', period='1y', interval='1d', progress=False)
    vix = yf.download('^VIX', period='5d', interval='1d', progress=False)
    # Flatten MultiIndex columns if present
    if hasattr(spy.columns, 'levels'):
        spy.columns = [c[0] if isinstance(c, tuple) else c for c in spy.columns]
    if hasattr(vix.columns, 'levels'):
        vix.columns = [c[0] if isinstance(c, tuple) else c for c in vix.columns]
    c = spy['Close']
    ma7 = float(c.rolling(7).mean().iloc[-1])
    ma23 = float(c.rolling(23).mean().iloc[-1])
    ma200 = float(c.rolling(200).mean().iloc[-1])
    price = float(c.iloc[-1])
    vix_val = float(vix['Close'].iloc[-1])
    print(json.dumps({"price": round(price, 2), "ma7": round(ma7, 2), "ma23": round(ma23, 2), "ma200": round(ma200, 2), "vix": round(vix_val, 2)}))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`

export async function GET() {
  try {
    // Fetch live market data via yfinance
    const raw = execSync(`python3 -c '${PYTHON_SCRIPT.replace(/'/g, "'\\''")}'`, {
      timeout: 30000,
      encoding: 'utf-8',
    }).trim()

    const market = JSON.parse(raw)
    if (market.error) {
      return NextResponse.json({ error: market.error }, { status: 500 })
    }

    // Compute signal
    const VIX_THRESHOLD = 28
    let signal: string = 'STAND_BY'
    if (market.vix > VIX_THRESHOLD) {
      signal = 'BEAR'
    } else if (market.price > market.ma7 && market.ma7 > market.ma23 && market.price > market.ma200) {
      signal = 'LONG'
    }

    // Read paper position if it exists
    let position = null
    const posFile = '/tmp/midas-paper-position.json'
    if (existsSync(posFile)) {
      try {
        const posData = JSON.parse(readFileSync(posFile, 'utf-8'))
        if (posData.status === 'IN_TRADE' || posData.position) {
          position = {
            status: posData.status || 'IN_TRADE',
            direction: posData.direction || posData.side || 'LONG',
            entry: posData.entry_price || posData.entry,
            stop: posData.stop_loss || posData.stop,
            target: posData.take_profit || posData.target,
            pnl: posData.unrealized_pnl || posData.pnl,
            pnlPct: posData.unrealized_pnl_pct || posData.pnlPct,
            entryDate: posData.entry_date || posData.entryDate,
            ticker: posData.ticker || 'SPY',
          }
        }
      } catch { /* ignore parse errors */ }
    }

    return NextResponse.json({
      price: market.price,
      ma7: market.ma7,
      ma23: market.ma23,
      ma200: market.ma200,
      vix: market.vix,
      signal,
      position,
      lastUpdated: new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' }),
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
