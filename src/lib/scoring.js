// Profile resolution.
//
// Every candidate plays the same situations, in the same order, with the same cards in the same
// order (see src/data/situations.json). Each situation offers one card per value, and every card points to a behaviour of one value.
// The candidate picks two cards per round, without order: each pick gives 1 point to its value.
// The two values with the most points give the profile (dominant › second). When a tie decides
// either place, the candidate plays a tie-break round restricted to the tied values.

// Map from card id to the id of the value its behaviour belongs to.
export function cardValueIndex(situations, values) {
  const valueOfBehavior = new Map(values.flatMap((v) => v.behaviors.map((b) => [b.id, v.id])))
  return new Map(
    situations.flatMap((s) => s.cards.map((c) => [c.id, valueOfBehavior.get(c.behavior)])),
  )
}

// Points per value id: one per selected card.
export function countValues(deck, answers, valueOf, valueIds) {
  const totals = Object.fromEntries(valueIds.map((id) => [id, 0]))
  for (const round of deck) {
    for (const cardId of answers[round.id] ?? []) totals[valueOf.get(cardId)] += 1
  }
  return totals
}

// Ranks the first two values. `tiebreaks` are the tie-break rounds already played, in order:
// [{ between: [valueId…], chosen: cardId }].
// Returns { dominant, second } or { pending: [valueId…] } when a tie-break round is needed.
// Throws when the tie-breaks do not match the ties of these totals.
export function resolveRanking(totals, tiebreaks, valueOf) {
  const queue = [...tiebreaks]
  const ranked = []
  let remaining = Object.keys(totals)
  while (ranked.length < 2) {
    const best = Math.max(...remaining.map((id) => totals[id]))
    const tied = remaining.filter((id) => totals[id] === best)
    let winner = tied[0]
    if (tied.length > 1) {
      if (!queue.length) return { pending: tied }
      const tiebreak = queue.shift()
      winner = valueOf.get(tiebreak.chosen)
      const sameValues =
        tiebreak.between.length === tied.length && tied.every((id) => tiebreak.between.includes(id))
      if (!sameValues || !tied.includes(winner)) throw Error('Départage incohérent')
    }
    ranked.push(winner)
    remaining = remaining.filter((id) => id !== winner)
  }
  if (queue.length) throw Error('Départage en trop')
  return { dominant: ranked[0], second: ranked[1] }
}

// The next tie-break situation (fixed, in order), showing only the cards of the tied values.
export function createTiebreakRound(tiebreakSituations, played, between, valueOf) {
  const situation = tiebreakSituations[played]
  return { ...situation, cards: situation.cards.filter((c) => between.includes(valueOf.get(c.id))) }
}

export function findProfile(profiles, { dominant, second }) {
  return profiles.find((p) => p.dominant === dominant && p.second === second)
}
