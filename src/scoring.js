export const DIM_IDS = [
  'communication',
  'collaboration',
  'adaptabilite',
  'structuration',
  'ecoute',
  'initiative',
]

export function createDeck(situations, count = 8) {
  const shuffle = (xs) => {
    const out = [...xs]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  const groups = [...new Set(situations.map((s) => s.category))]
  const selected = shuffle(groups).map(
    (g) => shuffle(situations.filter((s) => s.category === g))[0],
  )
  const rest = shuffle(situations.filter((s) => !selected.some((p) => p.id === s.id)))
  return shuffle([...selected, ...rest.slice(0, Math.max(0, count - selected.length))])
    .slice(0, count)
    .map((s) => ({ ...s, cards: shuffle(s.cards) }))
}

// Results are relative behavioral preferences, never proficiency ratings.
// Expected points for each displayed card under random ranking: (4 + 1) / 4 = 1.25.
// An index of 50 means the observed selection matches its opportunity baseline.
export function calculate(deck, answers, meta) {
  const earned = Object.fromEntries(DIM_IDS.map((id) => [id, 0]))
  const opportunity = Object.fromEntries(DIM_IDS.map((id) => [id, 0]))
  const selections = Object.fromEntries(DIM_IDS.map((id) => [id, 0]))
  const first = Number(meta.game.firstWeight ?? 4),
    second = Number(meta.game.secondWeight ?? 1)
  deck.forEach((round) => {
    const picked = answers[round.id] || []
    for (const card of round.cards) {
      const pos = picked.indexOf(card.id)
      const points = pos === 0 ? first : pos === 1 ? second : 0
      for (const [dim, coeff] of [
        [card.primary, 1],
        [card.secondary, 0.35],
      ]) {
        opportunity[dim] += coeff
        earned[dim] += coeff * points
        if (points) selections[dim] += 1
      }
    }
  })
  const baseline = (first + second) / 4
  // Subtract the neutral expectation; map the theoretical interval to the full scale.
  // No arbitrary score inflation: a balanced profile can still be near the centre.
  const scores = Object.fromEntries(
    DIM_IDS.map((id) => {
      if (!opportunity[id]) return [id, null]
      const average = earned[id] / opportunity[id]
      const score =
        average >= baseline
          ? 50 + (50 * (average - baseline)) / (first - baseline)
          : 50 * (average / baseline)
      return [id, Math.round(Math.max(0, Math.min(100, score)))]
    }),
  )
  const ordered = DIM_IDS.filter((id) => scores[id] !== null).sort(
    (a, b) => scores[b] - scores[a] || selections[b] - selections[a] || a.localeCompare(b),
  )
  const styles = meta.styles
    .map((s) => ({
      ...s,
      score: s.dimensions.reduce((sum, id) => sum + (scores[id] ?? 50), 0) / s.dimensions.length,
    }))
    .sort((a, b) => b.score - a.score)
  return {
    scores,
    ordered,
    styles: styles.slice(0, 2),
    top: ordered.slice(0, 3),
    coverage: Object.fromEntries(DIM_IDS.map((id) => [id, Math.round(opportunity[id])])),
    answered: deck.filter((s) => (answers[s.id] || []).length === 2).length,
  }
}
