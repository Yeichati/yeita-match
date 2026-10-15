import { readFileSync } from 'node:fs'

export const readData = (file) =>
  JSON.parse(readFileSync(new URL(`../src/data/${file}`, import.meta.url), 'utf8'))

export const { values } = readData('values.json')
export const { profiles } = readData('profiles.json')
export const situationsFile = readData('situations.json')
export const { situations } = situationsFile
export const rounds = situationsFile.game.rounds
export const valueIds = values.map((v) => v.id)
