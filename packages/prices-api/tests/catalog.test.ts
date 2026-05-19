import { describe, expect, it } from 'vitest'
import { getEndpointCatalogStatus } from './catalog'

describe('endpoint catalog', () => {
  // Keep this as the single loud failure when endpoint wrappers and live test cases drift.
  // The live endpoint tests use the same guard and skip network calls when this is stale.
  it('covers every exported async endpoint wrapper', () => {
    expect(getEndpointCatalogStatus()).toEqual({
      missing: [],
      staleCases: [],
      staleExclusions: [],
    })
  })
})
