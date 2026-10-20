import { useMemo, useState } from 'react'
import SiteFooter from './components/SiteFooter.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import { NOTE_MAX_LENGTH } from './components/NotesPanel.jsx'
import { downloadJson, exportFileName, printWithTitle } from './lib/exports.js'
import { profiles, situations, tiebreakSituations, values } from './lib/gameData.js'
import {
  cardValueIndex,
  countValues,
  createTiebreakRound,
  findProfile,
  resolveRanking,
} from './lib/scoring.js'
import { parseSession, serializeSession } from './lib/session.js'
import PlayScreen from './screens/PlayScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import WelcomeScreen from './screens/WelcomeScreen.jsx'

const EMPTY_PERSON = {
  candidateName: '',
  hostName: '',
  date: new Date().toLocaleDateString('en-CA'),
}
const VALUE_IDS = values.map((v) => v.id)
const VALUE_OF_CARD = cardValueIndex([...situations, ...tiebreakSituations], values)
const valueById = (id) => values.find((v) => v.id === id)

// Profile reached by a set of answers and tie-breaks: { dominant, second } or { pending }.
function rankingOf(deck, answers, tiebreaks) {
  return resolveRanking(
    countValues(deck, answers, VALUE_OF_CARD, VALUE_IDS),
    tiebreaks,
    VALUE_OF_CARD,
  )
}

// Stages: "welcome" → "play" (rounds) → "tiebreak" (only on a tie, 1 or 2 rounds) → "results".
// "review" is reached by importing a saved game, to write notes after the interview.
export default function App() {
  const [stage, setStage] = useState('welcome')
  const [setupOpen, setSetupOpen] = useState(false)
  const [person, setPerson] = useState(EMPTY_PERSON)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [tiebreaks, setTiebreaks] = useState([])
  const [tiebreakRound, setTiebreakRound] = useState(null)
  const [tiebreakPick, setTiebreakPick] = useState([])
  const [notes, setNotes] = useState({})
  const [printWithNotes, setPrintWithNotes] = useState(true)
  const [importError, setImportError] = useState('')

  const showsProfile = stage === 'results' || stage === 'review'
  const round = deck[index]
  const selected = round ? answers[round.id] || [] : []
  const ranking = useMemo(
    () => (showsProfile ? rankingOf(deck, answers, tiebreaks) : null),
    [showsProfile, deck, answers, tiebreaks],
  )

  const updatePerson = (changes) => setPerson((p) => ({ ...p, ...changes }))

  function start() {
    if (!person.candidateName.trim() || !person.hostName.trim() || !person.date) return
    setDeck(situations)
    setAnswers({})
    setTiebreaks([])
    setNotes({})
    setIndex(0)
    setStage('play')
    setSetupOpen(false)
  }

  function reset() {
    setStage('welcome')
    setDeck([])
    setAnswers({})
    setTiebreaks([])
    setTiebreakRound(null)
    setIndex(0)
    setSetupOpen(false)
  }

  // Toggles a card; when `required` cards are selected, the others are disabled (see PlayScreen).
  const toggle = (list, cardId, required) =>
    list.includes(cardId)
      ? list.filter((id) => id !== cardId)
      : list.length < required
        ? [...list, cardId]
        : list

  function pick(cardId) {
    setAnswers((previous) => ({ ...previous, [round.id]: toggle(selected, cardId, 2) }))
  }

  // After the last round, and after each tie-break: show the profile, or play a tie-break round
  // with only the cards of the tied values.
  function continueWith(nextTiebreaks) {
    const next = rankingOf(deck, answers, nextTiebreaks)
    setTiebreaks(nextTiebreaks)
    setTiebreakPick([])
    if (next.pending) {
      setTiebreakRound({
        between: next.pending,
        situation: createTiebreakRound(
          tiebreakSituations,
          nextTiebreaks.length,
          next.pending,
          VALUE_OF_CARD,
        ),
      })
      setStage('tiebreak')
    } else {
      setTiebreakRound(null)
      setStage('results')
    }
  }

  function nextRound() {
    if (selected.length !== 2) return
    if (index < deck.length - 1) setIndex((i) => i + 1)
    else continueWith([])
  }

  function previousRound() {
    if (index === 0) reset()
    else setIndex((i) => i - 1)
  }

  function nextTiebreak() {
    if (tiebreakPick.length !== 1) return
    continueWith([
      ...tiebreaks,
      {
        situation: tiebreakRound.situation.id,
        between: tiebreakRound.between,
        chosen: tiebreakPick[0],
      },
    ])
  }

  // Going back from a tie-break returns to the last round; the tie-breaks are replayed after it.
  function leaveTiebreak() {
    setTiebreaks([])
    setTiebreakRound(null)
    setStage('play')
  }

  function saveJson() {
    downloadJson(
      serializeSession({ person, deck, answers, tiebreaks, notes }),
      exportFileName(person, { extension: 'json' }),
    )
  }

  async function importJson(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const session = parseSession(
        JSON.parse(await file.text()),
        situations,
        tiebreakSituations,
        VALUE_IDS,
        NOTE_MAX_LENGTH,
      )
      if (rankingOf(session.deck, session.answers, session.tiebreaks).pending)
        throw Error('Départage manquant')
      setPerson({
        ...EMPTY_PERSON,
        candidateName: session.candidateName,
        hostName: session.hostName,
        date: session.date,
      })
      setDeck(session.deck)
      setAnswers(session.answers)
      setTiebreaks(session.tiebreaks)
      setNotes(session.notes)
      setIndex(session.deck.length - 1)
      setStage('review')
      setImportError('')
    } catch (e) {
      setImportError('Import impossible : ' + e.message)
    }
  }

  function exportPdf(includeNotes) {
    setPrintWithNotes(includeNotes)
    printWithTitle(exportFileName(person, { notes: includeNotes }).replace(/\.pdf$/, ''))
  }

  return (
    <div className="app-shell">
      <SiteHeader onHome={reset} />
      <main className="main">
        {stage === 'welcome' && (
          <WelcomeScreen
            setupOpen={setupOpen}
            onOpenSetup={() => setSetupOpen(true)}
            onCloseSetup={() => setSetupOpen(false)}
            person={person}
            onPersonChange={updatePerson}
            onStart={start}
            onImport={importJson}
            importError={importError}
          />
        )}
        {stage === 'play' && round && (
          <PlayScreen
            round={round}
            index={index}
            total={deck.length}
            required={2}
            selected={selected}
            isLast={index === deck.length - 1}
            onPick={pick}
            onNext={nextRound}
            onBack={previousRound}
          />
        )}
        {stage === 'tiebreak' && tiebreakRound && (
          <PlayScreen
            round={tiebreakRound.situation}
            index={null}
            total={null}
            required={1}
            selected={tiebreakPick}
            isLast
            onPick={(cardId) => setTiebreakPick((list) => toggle(list, cardId, 1))}
            onNext={nextTiebreak}
            onBack={leaveTiebreak}
          />
        )}
        {showsProfile && ranking?.dominant && (
          <ProfileScreen
            mode={stage}
            person={person}
            profile={findProfile(profiles, ranking)}
            dominant={valueById(ranking.dominant)}
            second={valueById(ranking.second)}
            values={values}
            notes={notes}
            onNoteChange={(valueId, text) => setNotes((n) => ({ ...n, [valueId]: text }))}
            printWithNotes={printWithNotes}
            onSaveJson={saveJson}
            onExportPdf={exportPdf}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
