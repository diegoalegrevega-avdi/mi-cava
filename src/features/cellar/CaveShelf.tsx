import type { Cell } from '@/domain/caveLayout'
import { CaveBottle } from './CaveBottle'
import type { WineWithStock } from '@/db/schema'

interface CaveShelfProps {
  shelf: Cell[][]
  cellWidth: number
  cellHeight: number
  onBottleClick: (wine: WineWithStock) => void
  getSemaphore?: (wineId: string) => 'ready' | 'keep' | 'past' | 'unknown' | undefined
}

export function CaveShelf({ shelf, cellWidth, cellHeight, onBottleClick, getSemaphore }: CaveShelfProps) {
  return (
    <g>
      {shelf.map((row, depthIndex) =>
        row.map((cell, widthIndex) => (
          <g
            key={`${depthIndex}-${widthIndex}`}
            transform={`translate(${depthIndex * cellWidth}, ${widthIndex * cellHeight})`}
          >
            {/* Cell border */}
            <rect
              x={0}
              y={0}
              width={cellWidth}
              height={cellHeight}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {cell.wineId && cell.wine && (
              <CaveBottle
                wine={cell.wine}
                width={cellWidth}
                height={cellHeight}
                onClick={() => onBottleClick(cell.wine!)}
                semaphore={getSemaphore?.(cell.wineId)}
              />
            )}
          </g>
        ))
      )}
    </g>
  )
}