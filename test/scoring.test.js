import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cardValueIndex,
  countValues,
  createDeck,
  createTiebreakRound,
  findProfile,
  resolveRanking,
} from '../src/lib/scoring.js'
import { profiles, rounds, situations, valueIds, values } from './helpers.js'

const valueOf = cardValueIndex(situations, values)
const totals = (c, s, e, m) => ({
  collectif: c,
  'sans-chichi': s,
  explorateur: e,
  'meilleure-version': m,
})
// A card of the given value in a situation not used elsewhere in these tests.
const cardOf = (value, situation = situations.at(-1)) =>
  situation.cards.find((c) => valueOf.get(c.id) === value).id

test('createDeck draws distinct situations covering every category', () => {
  const categories = new Set(situations.map((s) => s.category))
  for (let run = 0; run < 200; run++) {
    const deck = createDeck(situations, rounds)
    assert.equal(deck.length, rounds)
    assert.equal(new Set(deck.map((s) => s.id)).size, rounds)
    assert.deepEqual(new Set(deck.map((s) => s.category)), categories)
  }
})

test('createDeck keeps the four cards of each situation and leaves the input untouched', () => {
  const before = JSON.stringify(situations)
  for (const drawn of createDeck(situations, rounds)) {
    const source = situations.find((s) => s.id === drawn.id)
    assert.deepEqual(new Set(drawn.cards.map((c) => c.id)), new Set(source.cards.map((c) => c.id)))
  }
  assert.equal(JSON.stringify(situations), before)
})

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
    chosen: cardOf('collectif', situations.at(-2)),
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

test('a tie-break round uses an unplayed situation and only the tied values', () => {
  const used = situations.slice(0, 40).map((s) => s.id)
  for (let run = 0; run < 100; run++) {
    const round = createTiebreakRound(situations, used, ['collectif', 'explorateur'], valueOf)
    assert.ok(!used.includes(round.id))
    assert.deepEqual(
      new Set(round.cards.map((c) => valueOf.get(c.id))),
      new Set(['collectif', 'explorateur']),
    )
  }
})

test('random games always end on one of the 12 profiles', () => {
  for (let run = 0; run < 500; run++) {
    const deck = createDeck(situations, rounds)
    const answers = Object.fromEntries(deck.map((s) => [s.id, [s.cards[0].id, s.cards[1].id]]))
    const counts = countValues(deck, answers, valueOf, valueIds)
    const tiebreaks = []
    let ranking = resolveRanking(counts, tiebreaks, valueOf)
    while (ranking.pending) {
      const used = [...deck, ...tiebreaks].map((x) => x.id ?? x.situation)
      const round = createTiebreakRound(situations, used, ranking.pending, valueOf)
      tiebreaks.push({ situation: round.id, between: ranking.pending, chosen: round.cards[0].id })
      ranking = resolveRanking(counts, tiebreaks, valueOf)
    }
    assert.ok(tiebreaks.length <= 2)
    assert.ok(findProfile(profiles, ranking))
  }
})
