import type { WineWithStock } from '@/db/schema'
import { layoutCave, type CaveConfig } from '@/domain/caveLayout'
import { drinkStatus } from '@/domain/drinkWindow'
import { CaveShelf } from './CaveShelf'
import { useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'

interface Cave3DProps {
  wines: WineWithStock[]
  config: CaveConfig
  onOpen: (wine: WineWithStock) => void
}

// One cell = one bottle slot: depth runs left → right, width (bottles deep) runs top → bottom.
const CELL_W = 52
const CELL_H = 64
const GAP = 18
const LEFT = 56
const TOP = 22
const OVERFLOW_H = 70

export function Cave3D({ wines, config, onOpen }: Cave3DProps) {
  const layout = useMemo(() => layoutCave(wines, config), [wines, config])
  const { t } = useI18n()

  const shelfH = config.width * CELL_H
  const svgW = LEFT + config.depth * CELL_W + 8
  const svgH =
    TOP + config.shelves * shelfH + (config.shelves - 1) * GAP +
    (layout.overflow.length > 0 ? OVERFLOW_H : 0) + 8

  return (
    <div className="w-full">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${t.cave3d.legend.depth}: ${config.depth}, ${t.cave3d.legend.width}: ${config.width}, ${t.cave3d.legend.shelves}: ${config.shelves}`}
      >
        {/* Depth markers, back of the cellar to the front */}
        <g>
          {Array.from({ length: config.depth }, (_, i) => (
            <text
              key={i}
              x={LEFT + i * CELL_W + CELL_W / 2}
              y={TOP - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#a69c92"
              fontFamily="system-ui"
            >
              {t.cave3d.depthLabel(i + 1)}
            </text>
          ))}
        </g>

        {layout.grid.map((shelf, shelfIndex) => (
          <g key={shelfIndex} transform={`translate(${LEFT}, ${TOP + shelfIndex * (shelfH + GAP)})`}>
            <rect x={0} y={0} width={config.depth * CELL_W} height={shelfH} rx={6} fill="#241f1c" />
            <text
              x={-10}
              y={shelfH / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#f2ede7"
              fontFamily="system-ui"
              fontWeight="500"
            >
              {t.cave3d.shelfLabel(shelfIndex + 1)}
            </text>
            <CaveShelf
              shelf={shelf}
              cellWidth={CELL_W}
              cellHeight={CELL_H}
              onBottleClick={onOpen}
              getSemaphore={(id) => {
                const wine = wines.find((w) => w.id === id)
                if (!wine) return undefined
                return drinkStatus(wine, new Date().getFullYear())
              }}
            />
          </g>
        ))}

        {/* Bottles that do not fit in the configured cellar */}
        {layout.overflow.length > 0 && (
          <g transform={`translate(${LEFT}, ${TOP + config.shelves * (shelfH + GAP) + 4})`}>
            <text
              x={-10}
              y={OVERFLOW_H / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="#c2a369"
              fontFamily="system-ui"
              fontWeight="500"
            >
              {t.cave3d.overflow}
            </text>
            {layout.overflow.map((item, i) => (
              <g key={item.wineId} transform={`translate(${i * 46}, 0)`}>
                <ellipse cx={20} cy={24} rx={14} ry={20} fill="#c2a369" opacity="0.75" />
                <text x={20} y={62} textAnchor="middle" fontSize="10" fill="#c2a369" fontFamily="system-ui">
                  +{item.count}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
        <div>
          {t.cave3d.legend.depth}: {config.depth}
        </div>
        <div>
          {t.cave3d.legend.width}: {config.width}
        </div>
        <div>
          {t.cave3d.legend.shelves}: {config.shelves}
        </div>
        <div>
          {t.cave3d.legend.capacity}: {config.depth * config.width * config.shelves}
        </div>
      </div>
    </div>
  )
}
