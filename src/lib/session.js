// Saved game file (.json): format, serialisation and validation on import.
// The file holds personal data (names) and the candidate's choices; it never leaves the browser
// except through the download triggered by the user. The profile itself is not stored: it is
// recomputed on import from the choices and tie-breaks, so it always matches them.

export const SESSION_FORMAT = 'yeita-match-session'
export const SESSION_VERSION = 2

export function serializeSession({ person, deck, answers, tiebreaks }) {
  return {
    format: SESSION_FORMAT,
    version: SESSION_VERSION,
    candidateName: person.candidateName.trim(),
    hostName: person.hostName.trim(),
    date: person.date,
    deck: deck.map((s) => s.id),
    answers,
    tiebreaks: tiebreaks.map((t) => ({
      situation: t.situation,
      between: t.between,
      chosen: t.chosen,
    })),
  }
}

// Returns { candidateName, hostName, date, deck, answers, tiebreaks } where deck holds the full
// situations. Throws an Error with a user-facing message when the file is not a valid saved game.
export function parseSession(obj, situations, rounds) {
  if (
    obj.format !== SESSION_FORMAT ||
    obj.version !== SESSION_VERSION ||
    !Array.isArray(obj.deck) ||
    !obj.candidateName ||
    !obj.hostName ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obj.date) ||
    !obj.answers ||
    typeof obj.answers !== 'object' ||
    !Array.isArray(obj.tiebreaks)
  )
    throw Error('Format non reconnu')

  const byId = (id) => situations.find((s) => s.id === id)
  const deck = obj.deck.map(byId)
  if (deck.length !== rounds || deck.some((s) => !s) || new Set(obj.deck).size !== deck.length)
    throw Error('Situations invalides')

  for (const scene of deck) {
    const picks = obj.answers[scene.id]
    if (
      !Array.isArray(picks) ||
      picks.length !== 2 ||
      new Set(picks).size !== 2 ||
      picks.some((id) => !scene.cards.some((c) => c.id === id))
    )
      throw Error('Réponses invalides')
  }

  const used = new Set(obj.deck)
  for (const t of obj.tiebreaks) {
    const scene = byId(t?.situation)
    if (
      !scene ||
      used.has(scene.id) ||
      !Array.isArray(t.between) ||
      t.between.length < 2 ||
      !scene.cards.some((c) => c.id === t.chosen)
    )
      throw Error('Départage invalide')
    used.add(scene.id)
  }

  return {
    candidateName: obj.candidateName,
    hostName: obj.hostName,
    date: obj.date,
    deck,
    answers: obj.answers,
    tiebreaks: obj.tiebreaks,
  }
}
