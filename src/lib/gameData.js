// Game content, bundled with the code at build time: content and code always ship together, so a
// browser can never combine a cached version of one with a newer version of the other.
import situationsFile from '../data/situations.json'
import meta from '../data/dimensions.json'

export const situations = situationsFile.situations
export { meta }
