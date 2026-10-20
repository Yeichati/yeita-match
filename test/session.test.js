import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exportFileName } from '../src/lib/exports.js'
import { parseSession, serializeSession } from '../src/lib/session.js'
import { situations, tiebreakSituations, valueIds } from './helpers.js'

const deck = situations
const answers = Object.fromEntries(deck.map((s) => [s.id, [s.cards[0].id, s.cards[1].id]]))
const extra = tiebreakSituations[0]
const tiebreaks = [
  { situation: extra.id, between: ['collectif', 'explorateur'], chosen: extra.cards[0].id },
]
const person = { candidateName: '  Jeanne Émile ', hostName: 'Paul', date: '2026-10-15' }
const notes = { collectif: 'Cite deux exemples concrets.', explorateur: '' }
const valid = () => structuredClone(serializeSession({ person, deck, answers, tiebreaks, notes }))
const parse = (obj) => parseSession(obj, situations, tiebreakSituations, valueIds, 350)

test('a serialised game, tie-breaks included, can be imported back', () => {
  const session = parse(valid())
  assert.equal(session.candidateName, 'Jeanne Émile')
  assert.equal(session.hostName, 'Paul')
  assert.equal(session.date, '2026-10-15')
  assert.deepEqual(
    session.deck.map((s) => s.id),
    deck.map((s) => s.id),
  )
  assert.deepEqual(session.answers, answers)
  assert.deepEqual(session.tiebreaks, tiebreaks)
  assert.deepEqual(session.notes, notes)
})

test('a game saved without notes imports with empty notes', () => {
  const obj = valid()
  delete obj.notes
  assert.deepEqual(parse(obj).notes, {})
})

test('invalid notes are rejected', () => {
  for (const mutate of [
    (o) => (o.notes = 'texte'),
    (o) => (o.notes = { inconnue: 'x' }),
    (o) => (o.notes = { collectif: 42 }),
    (o) => (o.notes = { collectif: 'x'.repeat(351) }),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parse(obj), /Notes invalides/)
  }
})

test('files that are not a saved game of this version are rejected', () => {
  for (const mutate of [
    (o) => (o.format = 'other'),
    (o) => (o.version = 1),
    (o) => delete o.candidateName,
    (o) => (o.date = '15/10/2026'),
    (o) => (o.answers = null),
    (o) => delete o.tiebreaks,
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parse(obj), /Format non reconnu/)
  }
})

test('situations other than the fixed ones, in their order, are rejected', () => {
  for (const mutate of [
    (o) => o.deck.reverse(),
    (o) => (o.deck[0] = 'does-not-exist'),
    (o) => o.deck.pop(),
    (o) => (o.deck[1] = o.deck[0]),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parse(obj), /Situations invalides/)
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
    assert.throws(() => parse(obj), /Réponses invalides/)
  }
})

test('inconsistent tie-breaks are rejected', () => {
  for (const mutate of [
    (o) => (o.tiebreaks[0].situation = 'does-not-exist'),
    (o) => (o.tiebreaks[0].situation = deck[0].id),
    (o) => (o.tiebreaks[0].situation = tiebreakSituations[1].id),
    (o) => (o.tiebreaks[0].chosen = deck[0].cards[0].id),
    (o) => (o.tiebreaks[0].between = ['collectif']),
    (o) => o.tiebreaks.push(o.tiebreaks[0]),
  ]) {
    const obj = valid()
    mutate(obj)
    assert.throws(() => parse(obj), /Départage invalide/)
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
