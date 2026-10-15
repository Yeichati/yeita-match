import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { exportFileName } from '../src/lib/exports.js'
import { parseSession, serializeSession } from '../src/lib/session.js'

const { situations } = JSON.parse(
  readFileSync(new URL('../public/data/situations.json', import.meta.url), 'utf8'),
)
const ROUNDS = 8
const deck = situations.slice(0, ROUNDS)
const answers = Object.fromEntries(deck.map((s) => [s.id, [s.cards[0].id, s.cards[1].id]]))
const person = { candidateName: '  Jeanne Émile ', hostName: 'Paul', date: '2026-10-15' }
const valid = () => structuredClone(serializeSession({ person, deck, answers }))

test('a serialised game can be imported back', () => {
  const session = parseSession(valid(), situations, ROUNDS)
  assert.equal(session.candidateName, 'Jeanne Émile')
  assert.equal(session.hostName, 'Paul')
  assert.equal(session.date, '2026-10-15')
  assert.deepEqual(
    session.deck.map((s) => s.id),
    deck.map((s) => s.id),
  )
  assert.deepEqual(session.answers, answers)
})

test('files that are not a saved game are rejected', () => {
  for (const mutate of [
    (o) => (o.format = 'other'),
    (o) => (o.version = 2),
    (o) => delete o.candidateName,
    (o) => (o.date = '15/10/2026'),
    (o) => (o.answers = null),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parseSession(obj, situations, ROUNDS), /Format non reconnu/)
  }
})

test('unknown, missing or duplicated situations are rejected', () => {
  for (const mutate of [
    (o) => (o.deck[0] = 'does-not-exist'),
    (o) => o.deck.pop(),
    (o) => (o.deck[1] = o.deck[0]),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parseSession(obj, situations, ROUNDS), /Situations invalides/)
  }
})

test('incomplete or inconsistent answers are rejected', () => {
  const first = deck[0]
  for (const mutate of [
    (o) => delete o.answers[first.id],
    (o) => (o.answers[first.id] = [first.cards[0].id]),
    (o) => (o.answers[first.id] = [first.cards[0].id, first.cards[0].id]),
    (o) => (o.answers[first.id] = [first.cards[0].id, deck[1].cards[0].id]),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parseSession(obj, situations, ROUNDS), /Réponses invalides/)
  }
})

test('export file names strip accents and characters forbidden in file names', () => {
  const p = { candidateName: 'Jeanne Émile', hostName: 'Paul: Hôte/Test', date: '2026-10-15' }
  assert.equal(
    exportFileName(p, { extension: 'json' }),
    'Fiche Yeita - Jeanne Emile avec Paul- Hote-Test - 2026-10-15.json',
  )
  assert.equal(
    exportFileName(p, { notes: true }),
    'Fiche Yeita - Jeanne Emile avec Paul- Hote-Test - 2026-10-15 - Notes.pdf',
  )
})
