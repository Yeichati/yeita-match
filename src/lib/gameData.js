// Game content, bundled with the code at build time: content and code always ship together, so a
// browser can never combine a cached version of one with a newer version of the other.
import profilesFile from '../data/profiles.json'
import situationsFile from '../data/situations.json'
import valuesFile from '../data/values.json'

export const values = valuesFile.values
export const profiles = profilesFile.profiles
export const situations = situationsFile.situations
export const rounds = situationsFile.game.rounds
