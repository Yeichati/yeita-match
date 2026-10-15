// Saved game file (.json): format, serialisation and validation on import.
// The file holds personal data (names) and the candidate's choices; it never leaves the browser
// except through the download triggered by the user.

export const SESSION_FORMAT = 'yeita-match-session'
export const SESSION_VERSION = 1

export function serializeSession({ person, deck, answers }) {
  return {
    format: SESSION_FORMAT,
    version: SESSION_VERSION,
    candidateName: person.candidateName.trim(),
    hostName: person.hostName.trim(),
    date: person.date,
    deck: deck.map((s) => s.id),
    answers,
  }
}

// Returns { candidateName, hostName, date, deck, answers } where deck holds the full situations.
// Throws an Error with a user-facing message when the file is not a valid saved game.
export function parseSession(obj, situations, rounds) {
  if (
    obj.format !== SESSION_FORMAT ||
    obj.version !== SESSION_VERSION ||
    !Array.isArray(obj.deck) ||
    !obj.candidateName ||
    !obj.hostName ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obj.date) ||
    !obj.answers ||
    typeof obj.answers !== 'object'
  )
    throw Error('Format non reconnu')

  const deck = obj.deck.map((id) => situations.find((s) => s.id === id))
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

  return {
    candidateName: obj.candidateName,
    hostName: obj.hostName,
    date: obj.date,
    deck,
    answers: obj.answers,
  }
}
