import { useMemo, useState } from 'react'
import SiteFooter from './components/SiteFooter.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import { downloadJson, exportFileName, printWithTitle } from './lib/exports.js'
import { meta, situations } from './lib/gameData.js'
import { calculate, createDeck } from './lib/scoring.js'
import { parseSession, serializeSession } from './lib/session.js'
import PlayScreen from './screens/PlayScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import WelcomeScreen from './screens/WelcomeScreen.jsx'

const EMPTY_PERSON = {
  candidateName: '',
  hostName: '',
  date: new Date().toLocaleDateString('en-CA'),
  notes: '',
  followup: '',
}

// Stages: "welcome" → "play" (8 rounds) → "results".
// "review" is reached by importing a saved game, to write notes after the interview.
export default function App() {
  const [stage, setStage] = useState('welcome')
  const [setupOpen, setSetupOpen] = useState(false)
  const [person, setPerson] = useState(EMPTY_PERSON)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [printWithNotes, setPrintWithNotes] = useState(true)
  const [importError, setImportError] = useState('')

  const showsResult = stage === 'results' || stage === 'review'
  const round = deck[index]
  const selected = round ? answers[round.id] || [] : []
  const dimensions = meta.dimensions
  const result = useMemo(
    () => (deck.length && showsResult ? calculate(deck, answers, meta) : null),
    [deck, answers, showsResult],
  )

  const updatePerson = (changes) => setPerson((p) => ({ ...p, ...changes }))

  function start() {
    if (!person.candidateName.trim() || !person.hostName.trim() || !person.date) return
    setDeck(createDeck(situations, meta.game.rounds))
    setAnswers({})
    setIndex(0)
    setStage('play')
    setSetupOpen(false)
  }

  function reset() {
    setStage('welcome')
    setDeck([])
    setAnswers({})
    setIndex(0)
    setSetupOpen(false)
  }

  // Clicking a chosen card unselects it; a third click replaces the second choice.
  function pick(cardId) {
    const next = selected.includes(cardId)
      ? selected.filter((id) => id !== cardId)
      : selected.length < 2
        ? [...selected, cardId]
        : [selected[0], cardId]
    setAnswers((previous) => ({ ...previous, [round.id]: next }))
  }

  function nextRound() {
    if (selected.length !== 2) return
    if (index >= deck.length - 1) setStage('results')
    else setIndex((i) => i + 1)
  }

  function previousRound() {
    if (index === 0) reset()
    else setIndex((i) => i - 1)
  }

  function saveJson() {
    downloadJson(
      serializeSession({ person, deck, answers }),
      exportFileName(person, { extension: 'json' }),
    )
  }

  async function importJson(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const session = parseSession(JSON.parse(await file.text()), situations, meta.game.rounds)
      setPerson({
        ...EMPTY_PERSON,
        candidateName: session.candidateName,
        hostName: session.hostName,
        date: session.date,
      })
      setDeck(session.deck)
      setAnswers(session.answers)
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
            selected={selected}
            onPick={pick}
            onNext={nextRound}
            onBack={previousRound}
          />
        )}
        {showsResult && result && (
          <ResultScreen
            mode={stage}
            person={person}
            result={result}
            dimensions={dimensions}
            printWithNotes={printWithNotes}
            onSaveJson={saveJson}
            onExportPdf={exportPdf}
            onPersonChange={updatePerson}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
