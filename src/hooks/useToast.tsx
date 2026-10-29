import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastBar } from '@/components/ui/Toast'

export type ToastAction = { label: string; onClick: () => void }
type Toast = { id: number; message: string; action?: ToastAction }
type ToastApi = { show: (message: string, action?: ToastAction) => void }

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const show = useCallback((message: string, action?: ToastAction) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message, action })
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <ToastBar key={toast.id} message={toast.message} action={toast.action} onDismiss={dismiss} />
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast necesita un ToastProvider')
  return ctx
}
