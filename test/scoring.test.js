import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cardValueIndex,
  countValues,
  createTiebreakRound,
  findProfile,
  resolveRanking,
} from '../src/lib/scoring.js'
import { profiles, situations, tiebreakSituations, valueIds, values } from './helpers.js'

const valueOf = cardValueIndex([...situations, ...tiebreakSituations], values)
const totals = (c, s, e, m) => ({
  collectif: c,
  'sans-chichi': s,
  explorateur: e,
  'meilleure-version': m,
})
// A card of the given value, by default in the first tie-break situation.
const cardOf = (value, situation = tiebreakSituations[0]) =>
  situation.cards.find((c) => valueOf.get(c.id) === value).id

test('each selected card gives one point to its value', () => {
  const deck = situations.slice(0, 3)
  const answers = {
    [deck[0].id]: [cardOf('collectif', deck[0]), cardOf('explorateur', deck[0])],
    [deck[1].id]: [cardOf('collectif', deck[1]), cardOf('sans-chichi', deck[1])],
    [deck[2].id]: [cardOf('collectif', deck[2]), cardOf('explorateur', deck[2])],
  }
  assert.deepEqual(countValues(deck, answers, valueOf, valueIds), totals(3, 1, 2, 0))
})

test('the two highest values give the profile, in order', () => {
  const ranking = resolveRanking(totals(6, 2, 5, 3), [], valueOf)
  assert.deepEqual(ranking, { dominant: 'collectif', second: 'explorateur' })
  assert.equal(findProfile(profiles, ranking).label, 'Passerelle')
})

test('a tie for third place needs no tie-break', () => {
  assert.deepEqual(resolveRanking(totals(6, 4, 3, 3), [], valueOf), {
    dominant: 'collectif',
    second: 'sans-chichi',
  })
})

test('a tie for second place asks for a tie-break between the tied values only', () => {
  assert.deepEqual(resolveRanking(totals(5, 4, 4, 3), [], valueOf), {
    pending: ['sans-chichi', 'explorateur'],
  })
  const tiebreak = { between: ['sans-chichi', 'explorateur'], chosen: cardOf('explorateur') }
  assert.deepEqual(resolveRanking(totals(5, 4, 4, 3), [tiebreak], valueOf), {
    dominant: 'collectif',
    second: 'explorateur',
  })
})

test('a tie for first place between two values settles both places', () => {
  const tiebreak = {
    between: ['collectif', 'meilleure-version'],
    chosen: cardOf('meilleure-version'),
  }
  assert.deepEqual(resolveRanking(totals(5, 3, 3, 5), [tiebreak], valueOf), {
    dominant: 'meilleure-version',
    second: 'collectif',
  })
})

test('a four-way tie needs two tie-break rounds', () => {
  const all = totals(4, 4, 4, 4)
  assert.deepEqual(resolveRanking(all, [], valueOf), { pending: valueIds })
  const first = { between: valueIds, chosen: cardOf('sans-chichi') }
  assert.deepEqual(resolveRanking(all, [first], valueOf), {
    pending: ['collectif', 'explorateur', 'meilleure-version'],
  })
  const second = {
    between: ['collectif', 'explorateur', 'meilleure-version'],
    chosen: cardOf('collectif', tiebreakSituations[1]),
  }
  assert.deepEqual(resolveRanking(all, [first, second], valueOf), {
    dominant: 'sans-chichi',
    second: 'collectif',
  })
})

test('tie-breaks that do not match the totals are rejected', () => {
  const wrongValues = { between: ['collectif', 'sans-chichi'], chosen: cardOf('collectif') }
  assert.throws(() => resolveRanking(totals(5, 4, 4, 3), [wrongValues], valueOf), /incohérent/)
  const extra = { between: ['sans-chichi', 'explorateur'], chosen: cardOf('explorateur') }
  assert.throws(() => resolveRanking(totals(6, 4, 3, 3), [extra], valueOf), /en trop/)
})

test('tie-break rounds use the fixed tie-break situations in order, cards in their order', () => {
  const between = ['collectif', 'explorateur']
  const first = createTiebreakRound(tiebreakSituations, 0, between, valueOf)
  assert.equal(first.id, tiebreakSituations[0].id)
  assert.deepEqual(
    first.cards.map((c) => c.id),
    tiebreakSituations[0].cards.filter((c) => between.includes(valueOf.get(c.id))).map((c) => c.id),
  )
  assert.equal(
    createTiebreakRound(tiebreakSituations, 1, between, valueOf).id,
    tiebreakSituations[1].id,
  )
})

test('random answers on the fixed situations always end on one of the 12 profiles', () => {
  const pick = (cards) => {
    const i = Math.floor(Math.random() * cards.length)
    const j = (i + 1 + Math.floor(Math.random() * (cards.length - 1))) % cards.length
    return [cards[i].id, cards[j].id]
  }
  for (let run = 0; run < 1000; run++) {
    const answers = Object.fromEntries(situations.map((s) => [s.id, pick(s.cards)]))
    const counts = countValues(situations, answers, valueOf, valueIds)
    const tiebreaks = []
    let ranking = resolveRanking(counts, tiebreaks, valueOf)
    while (ranking.pending) {
      const round = createTiebreakRound(
        tiebreakSituations,
        tiebreaks.length,
        ranking.pending,
        valueOf,
      )
      tiebreaks.push({ situation: round.id, between: ranking.pending, chosen: round.cards[0].id })
      ranking = resolveRanking(counts, tiebreaks, valueOf)
    }
    assert.ok(tiebreaks.length <= tiebreakSituations.length)
    assert.ok(findProfile(profiles, ranking))
  }
})
