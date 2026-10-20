// Saved game file (.json): format, serialisation and validation on import.
// The file holds personal data (names) and the candidate's choices; it never leaves the browser
// except through the download triggered by the user. The profile itself is not stored: it is
// recomputed on import from the choices and tie-breaks, so it always matches them. Notes (one per
// value) are optional: the file is first saved at the end of the game, then again with the notes.

export const SESSION_FORMAT = 'yeita-match-session'
export const SESSION_VERSION = 2

export function serializeSession({ person, deck, answers, tiebreaks, notes = {} }) {
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
    notes,
  }
}

// Returns { candidateName, hostName, date, deck, answers, tiebreaks, notes } where deck holds the
// full situations. Throws an Error with a user-facing message when the file is not a valid saved game.
export function parseSession(obj, situations, tiebreakSituations, valueIds, maxNoteLength) {
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

  // Every game plays the same situations in the same order.
  if (obj.deck.length !== situations.length || obj.deck.some((id, i) => id !== situations[i].id))
    throw Error('Situations invalides')
  const deck = situations

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

  // Tie-break situations are used in their fixed order.
  if (obj.tiebreaks.length > tiebreakSituations.length) throw Error('Départage invalide')
  for (const [i, t] of obj.tiebreaks.entries()) {
    const scene = tiebreakSituations[i]
    if (
      t?.situation !== scene.id ||
      !Array.isArray(t.between) ||
      t.between.length < 2 ||
      !scene.cards.some((c) => c.id === t.chosen)
    )
      throw Error('Départage invalide')
  }

  const notes = obj.notes ?? {}
  if (
    typeof notes !== 'object' ||
    Array.isArray(notes) ||
    Object.entries(notes).some(
      ([id, text]) =>
        !valueIds.includes(id) || typeof text !== 'string' || text.length > maxNoteLength,
    )
  )
    throw Error('Notes invalides')

  return {
    candidateName: obj.candidateName,
    hostName: obj.hostName,
    date: obj.date,
    deck,
    answers: obj.answers,
    tiebreaks: obj.tiebreaks,
    notes,
  }
}
