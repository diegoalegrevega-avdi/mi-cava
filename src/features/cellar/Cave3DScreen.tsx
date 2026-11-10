import { useWines } from '@/hooks/useWines'
import { Cave3D } from './Cave3D'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

export function Cave3DScreen() {
  const { wines } = useWines()
  const config = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('micava.cave') || '{"depth":8,"width":1,"shelves":3,"fill":"wine"}')
    : { depth: 8, width: 1, shelves: 3, fill: 'wine' }
  const { show } = useToast()

  function handleOpen() {
    window.location.hash = '#/cava'
    // The CellarScreen will handle opening the sheet
    show('Abre la ficha desde la lista principal')
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl">Cava 3D</h2>
        <Button variant="secondary" onClick={() => window.location.hash = '#/cava'}>
          Volver a la lista
        </Button>
      </div>
      <Cave3D wines={wines} config={config} onOpen={handleOpen} />
    </div>
  )
}