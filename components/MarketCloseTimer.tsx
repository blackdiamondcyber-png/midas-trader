'use client'

import { useEffect, useState } from 'react'

function getTimeToMarketClose(): { hours: number; minutes: number; seconds: number; isOpen: boolean } {
  const now = new Date()
  // Market close is 4:00 PM ET
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay() // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6

  const closeET = new Date(et)
  closeET.setHours(16, 0, 0, 0)

  const openET = new Date(et)
  openET.setHours(9, 30, 0, 0)

  const isOpen = !isWeekend && et >= openET && et < closeET

  if (!isOpen) {
    return { hours: 0, minutes: 0, seconds: 0, isOpen: false }
  }

  const diffMs = closeET.getTime() - et.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return { hours, minutes, seconds, isOpen: true }
}

export default function MarketCloseTimer() {
  const [time, setTime] = useState(getTimeToMarketClose())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeToMarketClose()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (!time.isOpen) {
    return (
      <div className="card flex flex-col gap-3">
        <span className="label">Market Status</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xl font-bold text-slate-300">CLOSED</span>
        </div>
        <p className="text-xs text-slate-500">NYSE opens weekdays 9:30 AM ET</p>
      </div>
    )
  }

  const urgency = time.hours === 0 && time.minutes < 30
  return (
    <div className="card flex flex-col gap-3">
      <span className="label">Time to Market Close</span>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className={`text-2xl font-bold font-mono tabular-nums ${urgency ? 'text-yellow-400' : 'text-white'}`}>
          {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
        </span>
      </div>
      <p className="text-xs text-slate-500">NYSE closes 4:00 PM ET</p>
    </div>
  )
}
