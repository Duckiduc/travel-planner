'use client'

import { useState, useEffect } from 'react'

interface SummaryRow {
  category: string
  planned: number
  actual: number
  count: number
}

interface Summary {
  summary: SummaryRow[]
  totals: { planned: number; actual: number }
  currency: string
}

export function BudgetSummary({ tripId, currency }: { tripId: string; currency: string }) {
  const [data, setData] = useState<Summary | null>(null)

  useEffect(() => {
    fetch(`/api/trips/${tripId}/budget-summary`)
      .then((r) => r.json())
      .then(setData)
  }, [tripId])

  if (!data) return <div className="h-20 bg-gray-50 animate-pulse rounded" />

  const active = data.summary.filter((r) => r.count > 0)

  if (active.length === 0) {
    return <p className="text-sm text-gray-400">No budget items yet</p>
  }

  return (
    <div className="space-y-2">
      {active.map((row) => {
        const pct = row.planned > 0 ? Math.min((row.actual / row.planned) * 100, 100) : 0
        const over = row.actual > row.planned
        return (
          <div key={row.category}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">{row.category}</span>
              <span className={over ? 'text-red-500 font-medium' : 'text-gray-500'}>
                {currency} {row.actual.toFixed(0)} / {row.planned.toFixed(0)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${over ? 'bg-red-400' : 'bg-primary'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
      <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold">
        <span>Total</span>
        <span>
          {currency} {data.totals.actual.toFixed(2)} / {data.totals.planned.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
