'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertTriangle } from 'lucide-react'
import { DocumentForm } from './DocumentForm'

interface Doc {
  id: string
  type: 'PASSPORT' | 'VISA' | 'INSURANCE' | 'OTHER'
  title: string
  issuedTo?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  fileUrl?: string | null
  notes?: string | null
}

function expiryVariant(expiryDate: string | null | undefined): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (!expiryDate) return 'secondary'
  const diff = new Date(expiryDate).getTime() - Date.now()
  const days = diff / (1000 * 60 * 60 * 24)
  if (days < 0) return 'destructive'
  if (days < 90) return 'warning'
  return 'success'
}

export function DocumentList({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<Doc[]>([])
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const res = await fetch(`/api/trips/${tripId}/documents`)
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
          Add Document
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No documents yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((doc) => {
            const ev = expiryVariant(doc.expiryDate)
            return (
              <div key={doc.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      {doc.expiryDate && (
                        <Badge variant={ev} className="text-xs flex items-center gap-1">
                          {(ev === 'warning' || ev === 'destructive') && <AlertTriangle className="h-3 w-3" />}
                          Expires {fmt(doc.expiryDate)}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    {doc.issuedTo && <p className="text-sm text-gray-500">Issued to: {doc.issuedTo}</p>}
                    {doc.issueDate && <p className="text-xs text-gray-400">Issued: {fmt(doc.issueDate)}</p>}
                  </div>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      View
                    </a>
                  )}
                </div>
                {doc.notes && <p className="text-xs text-gray-500 mt-2 border-t pt-2">{doc.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <DocumentForm
          tripId={tripId}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}
