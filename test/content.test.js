// Integrity of the game content (src/data/*.json). These checks guard the content edits made by
// hand in the JSON files: a failing test names the faulty entry.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { profiles, situations, tiebreakSituations, valueIds, values } from './helpers.js'

const behaviorValue = new Map(values.flatMap((v) => v.behaviors.map((b) => [b.id, v.id])))

test('4 values with 3 behaviours each, unique ids, all texts filled', () => {
  assert.equal(values.length, 4)
  const ids = [...valueIds, ...values.flatMap((v) => v.behaviors.map((b) => b.id))]
  assert.equal(new Set(ids).size, ids.length)
  for (const v of values) {
    assert.equal(v.behaviors.length, 3, v.id)
    assert.ok(v.label && v.expectation && v.color && v.tint, v.id)
    for (const b of v.behaviors) assert.ok(b.label && b.description && b.softSkills, b.id)
  }
})

test('exactly one profile per ordered pair of distinct values', () => {
  assert.equal(profiles.length, 12)
  assert.equal(new Set(profiles.map((p) => p.id)).size, 12)
  for (const d of valueIds) {
    for (const s of valueIds) {
      if (d === s) continue
      const found = profiles.filter((p) => p.dominant === d && p.second === s)
      assert.equal(found.length, 1, `${d} › ${s}`)
      assert.ok(found[0].label && found[0].description, found[0].id)
      assert.ok(Array.isArray(found[0].presentation), found[0].id)
      assert.ok(
        found[0].presentation.length >= 2 && found[0].presentation.every(Boolean),
        found[0].id,
      )
    }
  }
})

const allSituations = [...situations, ...tiebreakSituations]
const valuesOf = (s) => s.cards.map((c) => behaviorValue.get(c.behavior))

test('8 fixed situations and 2 tie-break situations', () => {
  assert.equal(situations.length, 8)
  assert.equal(tiebreakSituations.length, 2)
})

test('each situation has 4 cards, one per value, with known behaviours', () => {
  for (const s of allSituations) {
    assert.ok(s.title && s.context, s.id)
    assert.equal(s.cards.length, 4, s.id)
    for (const c of s.cards) assert.ok(behaviorValue.has(c.behavior) && c.label, c.id)
    assert.deepEqual(new Set(valuesOf(s)), new Set(valueIds), s.id)
  }
})

test('cards are not shuffled, so each value appears equally often at each position', () => {
  for (const id of valueIds) {
    const positions = situations.map((s) => valuesOf(s).indexOf(id))
    for (let p = 0; p < 4; p++) {
      assert.equal(positions.filter((x) => x === p).length, situations.length / 4, `${id} @${p}`)
    }
  }
})

test('every behaviour of every value is played, none twice as often as another', () => {
  const counts = new Map()
  for (const s of situations)
    for (const c of s.cards) counts.set(c.behavior, (counts.get(c.behavior) ?? 0) + 1)
  for (const v of values) {
    const n = v.behaviors.map((b) => counts.get(b.id) ?? 0)
    assert.ok(Math.min(...n) >= 2 && Math.max(...n) - Math.min(...n) <= 1, `${v.id}: ${n}`)
  }
})

test('situation and card ids are unique', () => {
  const ids = allSituations.flatMap((s) => [s.id, ...s.cards.map((c) => c.id)])
  assert.equal(new Set(ids).size, ids.length)
})
