/** Produces replayable Cypress randomness by combining the logged run seed with the current spec path. */

const hashSeed = (seed: string) => {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export const createSeededRandom = (seed: string) => {
  let state = hashSeed(seed)

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export const getTestSeed = () => {
  const seed = process.env.TEST_SEED
  if (typeof seed !== 'string' || seed.length === 0) throw new Error('Missing Cypress TEST_SEED')
  return `${seed}:${Cypress.spec.relative}`
}
