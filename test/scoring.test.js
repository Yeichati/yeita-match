import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calculate, createDeck } from '../src/lib/scoring.js'

const readJson = (file) =>
  JSON.parse(readFileSync(new URL(`../public/data/${file}`, import.meta.url), 'utf8'))
const { situations } = readJson('situations.json')
const meta = readJson('dimensions.json')

const pickFirstTwo = (deck, offset = 0) =>
  Object.fromEntries(
    deck.map((s, i) => [s.id, [s.cards[(i + offset) % 4].id, s.cards[(i + offset + 1) % 4].id]]),
  )

test('createDeck draws the requested number of distinct situations', () => {
  for (let run = 0; run < 200; run++) {
    const deck = createDeck(situations, 8)
    assert.equal(deck.length, 8)
    assert.equal(new Set(deck.map((s) => s.id)).size, 8)
  }
})

test('createDeck covers every category', () => {
  const categories = new Set(situations.map((s) => s.category))
  for (let run = 0; run < 200; run++) {
    assert.deepEqual(new Set(createDeck(situations, 8).map((s) => s.category)), categories)
  }
})

test('createDeck keeps the same four cards per situation and does not mutate the input', () => {
  const before = JSON.stringify(situations)
  for (const drawn of createDeck(situations, 8)) {
    const source = situations.find((s) => s.id === drawn.id)
    assert.deepEqual(new Set(drawn.cards.map((c) => c.id)), new Set(source.cards.map((c) => c.id)))
  }
  assert.equal(JSON.stringify(situations), before)
})

test('calculate returns stable results for a fixed game (golden values)', () => {
  const deck = situations.filter((_, i) => i % 6 === 0).slice(0, 8)
  const result = calculate(deck, pickFirstTwo(deck), meta)
  assert.deepEqual(result.scores, {
    communication: 45,
    collaboration: 52,
    adaptabilite: 42,
    structuration: 42,
    ecoute: 42,
    initiative: 58,
  })
  assert.deepEqual(result.top, ['initiative', 'collaboration', 'communication'])
  assert.deepEqual(
    result.styles.map((s) => [s.id, s.score]),
    [
      ['catalyseur', 51.5],
      ['explorateur', 50],
    ],
  )
})

test('scores stay within 0..100 and the result shape is complete', () => {
  for (let run = 0; run < 200; run++) {
    const deck = createDeck(situations, 8)
    const result = calculate(deck, pickFirstTwo(deck, run), meta)
    for (const value of Object.values(result.scores)) {
      if (value !== null) assert.ok(value >= 0 && value <= 100)
    }
    assert.equal(result.top.length, 3)
    assert.equal(result.styles.length, 2)
  }
})

test('a dimension always chosen first scores 100, one never chosen scores 0', () => {
  const card = (id, primary, secondary) => ({ id, primary, secondary })
  const deck = [1, 2, 3].map((n) => ({
    id: `r${n}`,
    cards: [
      card(`r${n}-a`, 'initiative', 'initiative'),
      card(`r${n}-b`, 'ecoute', 'collaboration'),
      card(`r${n}-c`, 'structuration', 'collaboration'),
      card(`r${n}-d`, 'communication', 'collaboration'),
    ],
  }))
  const answers = Object.fromEntries(deck.map((r) => [r.id, [`${r.id}-a`, `${r.id}-b`]]))
  const { scores } = calculate(deck, answers, meta)
  assert.equal(scores.initiative, 100)
  assert.equal(scores.structuration, 0)
  assert.equal(scores.adaptabilite, null)
})
