import { useId } from 'react'

type ExecutionGaugeProps = {
  /** Percentual de execução total entre 0 e 100. */
  value: number
  label?: string
  className?: string
}

const SEGMENTS = 10
const CENTER_X = 180
const CENTER_Y = 178
const INNER_RADIUS = 94
const OUTER_RADIUS = 195
const GAP_DEGREES = 3.5

function polar(radius: number, degrees: number): string {
  const radians = (degrees * Math.PI) / 180
  const x = CENTER_X + radius * Math.cos(radians)
  const y = CENTER_Y - radius * Math.sin(radians)
  return `${x.toFixed(3)} ${y.toFixed(3)}`
}

/**
 * Uma fatia de anel semicircular, com cantos arredondados.
 * A faixa percorre o arco de startDegrees (esquerda) até endDegrees (direita).
 */
function wedgePath(startDegrees: number, endDegrees: number): string {
  const span = startDegrees - endDegrees
  if (span <= 0) return ''

  // Reduz o arredondamento no pedaço parcialmente preenchido.
  const cornerDegrees = Math.min(1.65, span / 4)
  const cornerRadius = Math.min(5, (span * Math.PI * INNER_RADIUS) / 720)

  return [
    `M ${polar(INNER_RADIUS + cornerRadius, startDegrees)}`,
    `L ${polar(OUTER_RADIUS - cornerRadius, startDegrees)}`,
    `Q ${polar(OUTER_RADIUS, startDegrees)} ${polar(OUTER_RADIUS, startDegrees - cornerDegrees)}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${polar(OUTER_RADIUS, endDegrees + cornerDegrees)}`,
    `Q ${polar(OUTER_RADIUS, endDegrees)} ${polar(OUTER_RADIUS - cornerRadius, endDegrees)}`,
    `L ${polar(INNER_RADIUS + cornerRadius, endDegrees)}`,
    `Q ${polar(INNER_RADIUS, endDegrees)} ${polar(INNER_RADIUS, endDegrees + cornerDegrees)}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${polar(INNER_RADIUS, startDegrees - cornerDegrees)}`,
    `Q ${polar(INNER_RADIUS, startDegrees)} ${polar(INNER_RADIUS + cornerRadius, startDegrees)}`,
    'Z',
  ].join(' ')
}

export default function ExecutionGauge({
  value,
  label = 'Execução total',
  className,
}: ExecutionGaugeProps) {
  const uid = useId().replace(/:/g, '')
  const gradientId = `execution-gradient-${uid}`
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  const filledSegments = (percent / 100) * SEGMENTS
  const displayPercent = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(percent)

  return (
    <svg
      className={className}
      viewBox="0 0 360 253"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${label}: ${displayPercent}%`}
      style={{ display: 'block', maxWidth: 400, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#29245F" />
          <stop offset="100%" stopColor="#46BCD1" />
        </linearGradient>
      </defs>

      {Array.from({ length: SEGMENTS }, (_, index) => {
        const step = 180 / SEGMENTS
        const start = 180 - index * step - GAP_DEGREES / 2
        const end = 180 - (index + 1) * step + GAP_DEGREES / 2
        const fraction = Math.max(0, Math.min(1, filledSegments - index))
        const activeEnd = start - (start - end) * fraction

        return (
          <g key={index}>
            <path d={wedgePath(start, end)} fill="#EBEFF2" />
            {fraction > 0 && (
              <path d={wedgePath(start, activeEnd)} fill={`url(#${gradientId})`} />
            )}
          </g>
        )
      })}

      <text
        x="180"
        y="188"
        textAnchor="middle"
        fill="#29245F"
        fontFamily="Roboto, Arial, sans-serif"
      >
        <tspan fontSize="70" fontWeight="700">{displayPercent}</tspan>
        <tspan fontSize="35" fontWeight="300">%</tspan>
      </text>
      <text
        x="180"
        y="241"
        textAnchor="middle"
        fontSize="30"
        fontWeight="400"
        fontFamily="Roboto, Arial, sans-serif"
        fill="#29245F"
      >
        {label}
      </text>
    </svg>
  )
}
