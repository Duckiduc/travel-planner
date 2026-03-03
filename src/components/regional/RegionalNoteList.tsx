'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface RegionalNote {
  id: string
  country: string
  destination?: string | null
  category: string
  title: string
  content: string
}

export function RegionalNoteList() {
  const [notes, setNotes] = useState<RegionalNote[]>([])
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  async function load(country?: string) {
    const url = country ? `/api/regional-notes?country=${encodeURIComponent(country)}` : '/api/regional-notes'
    const res = await fetch(url)
    if (res.ok) setNotes(await res.json())
  }

  useEffect(() => { load(countryFilter || undefined) }, [countryFilter])

  const filtered = notes.filter((n) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      n.title.toLowerCase().includes(s) ||
      n.content.toLowerCase().includes(s) ||
      n.category.toLowerCase().includes(s) ||
      n.country.toLowerCase().includes(s) ||
      (n.destination?.toLowerCase().includes(s) ?? false)
    )
  })

  const grouped = filtered.reduce<Record<string, RegionalNote[]>>((acc, note) => {
    const key = note.country
    acc[key] = acc[key] ?? []
    acc[key].push(note)
    return acc
  }, {})

  const countries = Array.from(new Set(notes.map((n) => n.country))).sort()

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 text-sm"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-400">No notes found</p>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([country, countryNotes]) => (
          <div key={country}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {country}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countryNotes.map((note) => (
                <div key={note.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{note.category}</Badge>
                      {note.destination && (
                        <Badge variant="outline" className="text-xs">{note.destination}</Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
