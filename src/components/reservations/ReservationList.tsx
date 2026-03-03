'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { ReservationForm } from './ReservationForm'

interface Reservation {
  id: string
  type: 'TRANSPORT' | 'LODGING' | 'ACTIVITY'
  title: string
  provider?: string | null
  confirmRef?: string | null
  startDate?: string | null
  endDate?: string | null
  amount?: number | null
  currency?: string | null
  status?: string | null
  notes?: string | null
}

const typeColors: Record<string, 'default' | 'secondary' | 'success'> = {
  TRANSPORT: 'default',
  LODGING: 'secondary',
  ACTIVITY: 'success',
}

export function ReservationList({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<Reservation[]>([])
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/reservations`)
    if (res.ok) setItems(await res.json())
  }

  useEffect(() => { load() }, [tripId]) // eslint-disable-line react-hooks/exhaustive-deps

  function fmt(d: string | null | undefined) {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Reservation
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No reservations yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={typeColors[item.type] ?? 'default'} className="text-xs">{item.type}</Badge>
                    {item.status && <span className="text-xs text-gray-500">{item.status}</span>}
                  </div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {item.provider && <p className="text-sm text-gray-500">{item.provider}</p>}
                  {item.confirmRef && (
                    <p className="text-xs text-gray-400">Ref: <span className="font-mono">{item.confirmRef}</span></p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {item.amount != null && (
                    <p className="font-semibold text-sm">{item.currency ?? ''} {item.amount.toFixed(2)}</p>
                  )}
                  {(item.startDate || item.endDate) && (
                    <p className="text-xs text-gray-400">
                      {fmt(item.startDate)}{item.endDate && ` – ${fmt(item.endDate)}`}
                    </p>
                  )}
                </div>
              </div>
              {item.notes && <p className="text-xs text-gray-500 mt-2 border-t pt-2">{item.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ReservationForm
          tripId={tripId}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}
