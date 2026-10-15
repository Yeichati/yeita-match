// Integrity of the game content (src/data/*.json). These checks guard the content edits made by
// hand in the JSON files: a failing test names the faulty entry.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { profiles, rounds, situations, situationsFile, valueIds, values } from './helpers.js'

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

test('each situation has 4 cards, one per value, with known behaviours', () => {
  for (const s of situations) {
    assert.ok(s.title && s.context && situationsFile.categories.includes(s.category), s.id)
    assert.equal(s.cards.length, 4, s.id)
    for (const c of s.cards) assert.ok(behaviorValue.has(c.behavior) && c.label, c.id)
    assert.deepEqual(
      new Set(s.cards.map((c) => behaviorValue.get(c.behavior))),
      new Set(valueIds),
      s.id,
    )
  }
})

test('situation and card ids are unique', () => {
  const ids = situations.flatMap((s) => [s.id, ...s.cards.map((c) => c.id)])
  assert.equal(new Set(ids).size, ids.length)
})

test('enough situations for a game and its tie-break rounds', () => {
  const categories = new Set(situations.map((s) => s.category))
  assert.ok(rounds >= categories.size)
  assert.ok(situations.length >= rounds + 2)
})
