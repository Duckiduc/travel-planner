'use client'

import { useToasterContext } from './toast'

export function useToast() {
  const { addToast } = useToasterContext()

  return {
    toast: (opts: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      addToast(opts)
    },
  }
}
