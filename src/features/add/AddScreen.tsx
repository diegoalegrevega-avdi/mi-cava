import type { WineDraft } from '@/db/schema'
import { createWine } from '@/db/repo'
import { useToast } from '@/hooks/useToast'
import { WineForm } from './WineForm'

export function AddScreen() {
  const { show } = useToast()

  async function handleSubmit(draft: WineDraft) {
    const { wine, merged } = await createWine(draft)
    show(merged ? `Botella añadida a ${wine.name}` : 'Añadido a la cava')
    window.location.hash = '#/cava'
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <WineForm submitLabel="Añadir a la cava" onSubmit={handleSubmit} />
    </div>
  )
}
