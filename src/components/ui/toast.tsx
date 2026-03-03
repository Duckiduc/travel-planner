'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  onDismiss: (id: string) => void
}

function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        variant === 'destructive'
          ? 'border-destructive bg-destructive text-destructive-foreground'
          : 'border bg-background text-foreground'
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
      >
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ToasterContextValue {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
}

interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const ToasterContext = React.createContext<ToasterContextValue | null>(null)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = React.useCallback((toast: Omit<ToastItem, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Math.random().toString(36).slice(2) }])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToasterContext.Provider>
  )
}

export function useToasterContext() {
  const ctx = React.useContext(ToasterContext)
  if (!ctx) throw new Error('useToasterContext must be used within ToasterProvider')
  return ctx
}

export function Toaster() {
  const ctx = React.useContext(ToasterContext)
  if (!ctx) return null
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {ctx.toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={ctx.dismissToast} />
      ))}
    </div>
  )
}
