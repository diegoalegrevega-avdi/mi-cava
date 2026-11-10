import type { WineWithStock } from '@/db/schema'
import { layoutCave, type CaveConfig } from '@/domain/caveLayout'
import { drinkStatus } from '@/domain/drinkWindow'
import { CaveShelf } from './CaveShelf'
import { useMemo } from 'react'

interface Cave3DProps {
  wines: WineWithStock[]
  config: CaveConfig
  onOpen: (wine: WineWithStock) => void
}

export function Cave3D({ wines, config, onOpen }: Cave3DProps) {
  const { depth, shelves } = config
  const layout = useMemo(() => layoutCave(wines, config), [wines, config])

  return (
    <div className="w-full" role="img" aria-label={`Cava 3D: ${config.shelves} pisos, ${config.depth} fondo, ${config.width} ancho`}>
      <svg
        width={depth * 60 + 80}
        height={shelves * 80 + (shelves - 1) * 20 + 60}
        viewBox={`-40 -30 ${depth * 60 + 80} ${shelves * 80 + (shelves - 1) * 20 + 60}`}
        className="w-full h-auto"
        style={{ background: 'transparent' }}
      >
        {/* Depth labels (top) */}
        <g transform="translate(60, -25)">
          {Array.from({ length: config.depth }, (_, i) => (
            <text
              key={i}
              x={i * 60 + 30}
              y={0}
              textAnchor="middle"
              fontSize="11"
              fill="#a69c92"
              fontFamily="system-ui"
            >
              F{i + 1}
            </text>
          ))}
        </g>

        {/* Shelves */}
        <g transform="translate(60, 10)">
          {layout.grid.map((shelf, shelfIndex) => (
            <g
              key={shelfIndex}
              transform={`translate(0, ${shelfIndex * 100})`}
            >
              {/* Shelf label */}
              <text
                x={-40}
                y={config.depth * 40}
                textAnchor="end"
                fontSize="12"
                fill="#f2ede7"
                fontFamily="system-ui"
                fontWeight="500"
              >
                Piso {shelfIndex + 1}
              </text>

              <CaveShelf
                shelf={shelf}
                cellWidth={60}
                cellHeight={80}
                onBottleClick={(wine) => onOpen(wine)}
                getSemaphore={(id) => {
                  const wine = wines.find(w => w.id === id)
                  if (!wine) return undefined
                  const status = drinkStatus(wine, new Date().getFullYear())
                  return status
                }}
              />
            </g>
          ))}

          {/* Overflow pile */}
          {layout.overflow.length > 0 && (
            <g transform={`translate(0, ${config.shelves * 100})`}>
              <text
                x={-40}
                y={40}
                textAnchor="end"
                fontSize="12"
                fill="#c2a369"
                fontFamily="system-ui"
                fontWeight="500"
              >
                Sobrantes
              </text>
              <g transform="translate(0, 10)">
                {layout.overflow.map((item, i) => (
                  <g key={item.wineId} transform={`translate(${i * 70}, 0)`}>
                    <ellipse cx={30} cy={30} rx={20} ry={40} fill="#c2a369" opacity="0.7" />
                    <text
                      x={30}
                      y={80}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#c2a369"
                    >
                      +{item.count}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
        <div>Profundidad: {config.depth}</div>
        <div>Ancho: {config.width}</div>
        <div>Pisos: {config.shelves}</div>
        <div>Capacidad: {config.depth * config.width * config.shelves}</div>
      </div>
    </div>
  )
}