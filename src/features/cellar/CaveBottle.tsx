import type { WineWithStock } from '@/db/schema'
import { TYPE_COLOR } from '@/domain/donut'

interface CaveBottleProps {
  wine: WineWithStock
  width: number
  height: number
  onClick: () => void
  semaphore?: 'ready' | 'keep' | 'past' | 'unknown'
}

export function CaveBottle({ wine, width, height, onClick, semaphore }: CaveBottleProps) {
  const color = wine.type ? TYPE_COLOR[wine.type] : '#6b625a'
  const semaphoreColors = {
    ready: '#4b8a5c',
    keep: '#c2a369',
    past: '#c0453f',
    unknown: '#6b625a',
  }
  const semColor = semaphore ? semaphoreColors[semaphore] : 'transparent'

  const bottleWidth = width * 0.8
  const bottleHeight = height * 0.9
  const neckWidth = bottleWidth * 0.4
  const neckHeight = bottleHeight * 0.25
  const bodyHeight = bottleHeight - neckHeight
  const cx = width / 2
  const cy = height - bodyHeight / 2

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Bottle body */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={bottleWidth / 2}
        ry={bodyHeight / 2}
        fill={color}
        opacity="0.9"
      />
      {/* Bottle neck */}
      <rect
        x={cx - neckWidth / 2}
        y={cy - bodyHeight / 2 - neckHeight}
        width={neckWidth}
        height={neckHeight}
        fill={color}
        opacity="0.9"
      />
      {/* Bottle top */}
      <ellipse
        cx={cx}
        cy={cy - bodyHeight / 2 - neckHeight}
        rx={neckWidth / 2}
        ry={neckWidth / 4}
        fill={color}
        opacity="0.9"
      />
      {/* Semaphore tag */}
      {semaphore && (
        <circle
          cx={width - 7}
          cy={7}
          r={5}
          fill={semColor}
          stroke="white"
          strokeWidth="1.5"
        />
      )}
    </g>
  )
}