import { describe, expect, it } from 'vitest'
import { minCutoffForTopK } from '@curvefi/primitives/array.utils'

describe('minCutoffForTopK', () => {
  const id = (x: number) => x

  ;[
    {
      name: 'enough ≥ threshold → pure threshold filter',
      items: [7, 5, 3, 1],
      threshold: 4,
      minCount: 2,
      expectedCutoff: 4,
    },
    {
      name: 'not enough ≥ threshold → fallback to top-K',
      items: [7, 5, 3, 1],
      threshold: 6,
      minCount: 2,
      expectedCutoff: 5,
    },
    {
      name: 'duplicates at cutoff (fallback)',
      items: [10, 9, 9, 8],
      threshold: 9.5,
      minCount: 2,
      expectedCutoff: 9,
    },
    {
      name: 'threshold equal to duplicate value',
      items: [10, 9, 9, 8],
      threshold: 9,
      minCount: 2,
      expectedCutoff: 9,
    },
    {
      name: 'minCount = 0 → pure threshold filter',
      items: [10, 8, 7],
      threshold: 9,
      minCount: 0,
      expectedCutoff: 9,
    },
    {
      name: 'fewer items than minCount',
      items: [10, 8],
      threshold: 9,
      minCount: 5,
      expectedCutoff: 8,
    },
    {
      name: 'empty input',
      items: [],
      threshold: 9,
      minCount: 3,
      expectedCutoff: 9,
    },
    {
      name: 'negatives and decimals',
      items: [-1.2, -3.4, 0.5],
      threshold: -2,
      minCount: 1,
      expectedCutoff: -2,
    },
  ].forEach(({ name, items, threshold, minCount, expectedCutoff }) => {
    it(name, () => {
      const cutoff = minCutoffForTopK(items, id, threshold, minCount)
      expect(cutoff).toBe(expectedCutoff)
    })
  })
})
