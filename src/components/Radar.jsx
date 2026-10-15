const CENTER = 160
const RADIUS = 107
const LABEL_RADIUS = 141
const RINGS = [0.25, 0.5, 0.75, 1]

// Radar chart of the dimension scores (0..100), one axis per dimension.
export default function Radar({ scores, dimensions }) {
  const ids = dimensions.map((d) => d.id)
  const point = (index, radius) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / ids.length
    return `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`
  }
  const valueRadius = (id) => (RADIUS * (scores[id] ?? 0)) / 100
  const polygon = (radius) => ids.map((_, i) => point(i, radius)).join(' ')
  const values = ids.map((id, i) => point(i, valueRadius(id))).join(' ')

  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label="Radar des tendances soft skills"
      className="radar"
    >
      {RINGS.map((f) => (
        <polygon
          key={f}
          points={polygon(RADIUS * f)}
          fill="none"
          stroke="#e6e8f0"
          strokeWidth="1.5"
        />
      ))}
      {ids.map((id, i) => {
        const [x2, y2] = point(i, RADIUS).split(',')
        return <line key={id} x1="160" y1="160" x2={x2} y2={y2} stroke="#e0e4ee" />
      })}
      <polygon
        points={values}
        fill="#7369df36"
        stroke="#7769d7"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {ids.map((id, i) => {
        const [cx, cy] = point(i, valueRadius(id)).split(',')
        return <circle key={id} cx={cx} cy={cy} r="4" fill="#7769d7" />
      })}
      {dimensions.map((d, i) => {
        const [x, y] = point(i, LABEL_RADIUS).split(',').map(Number)
        return (
          <text
            key={d.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="radar-label"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
