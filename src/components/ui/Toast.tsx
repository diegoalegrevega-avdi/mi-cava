import type { ToastAction } from '@/hooks/useToast'

export function ToastBar({
  message,
  action,
  onDismiss,
}: {
  message: string
  action?: ToastAction
  onDismiss: () => void
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text shadow-lg"
      >
        <span className="flex-1">{message}</span>
        {action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick()
              onDismiss()
            }}
            className="shrink-0 rounded-lg px-2 py-1 font-semibold text-gold hover:bg-gold/10"
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}
