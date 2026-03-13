'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/backtests', label: 'Backtests' },
  { href: '/prop-firms', label: 'Prop Firms' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-navy-border bg-navy sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-gold font-bold text-lg tracking-tight">⚡ MIDAS</span>
            <span className="text-slate-400 text-sm font-medium hidden sm:block">TRADER</span>
          </div>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-navy-mid text-gold border border-navy-border'
                      : 'text-slate-400 hover:text-white hover:bg-navy-mid'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">VIXRegimeStrategy v3</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live" />
          </div>
        </div>
      </div>
    </nav>
  )
}
