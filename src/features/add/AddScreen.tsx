import type { WineDraft } from '@/db/schema'
import { createWine } from '@/db/repo'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/hooks/useI18n'
import { WineForm } from './WineForm'

export function AddScreen() {
  const { show } = useToast()
  const { t } = useI18n()

  async function handleSubmit(draft: WineDraft) {
    const { wine, merged } = await createWine(draft)
    show(merged ? t.wine.toast.added.replace('{name}', wine.name) : t.add.submit)
    window.location.hash = '#/cava'
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <WineForm submitLabel={t.add.submit} onSubmit={handleSubmit} />
    </div>
  )
}
