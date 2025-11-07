import { describe, expect, it } from 'vitest'
import { minCutoffForTopK, takeTopWithMin } from './array'

describe('takeTopWithMin and minCutoffForTopK (numbers) - explicit cases', () => {
  const id = (x: number) => x

  ;[
    {
      name: 'enough ≥ threshold → pure threshold filter',
      items: [7, 5, 3, 1],
      threshold: 4,
      minCount: 2,
      expectedTop: [7, 5],
      expectedCutoff: 4,
    },
    {
      name: 'not enough ≥ threshold → fallback to top-K',
      items: [7, 5, 3, 1],
      threshold: 6,
      minCount: 2,
      expectedTop: [7, 5],
      expectedCutoff: 5,
    },
    {
      name: 'duplicates at cutoff (fallback)',
      items: [10, 9, 9, 8],
      threshold: 9.5,
      minCount: 2,
      expectedTop: [10, 9],
      expectedCutoff: 9,
    },
    {
      name: 'threshold equal to duplicate value',
      items: [10, 9, 9, 8],
      threshold: 9,
      minCount: 2,
      expectedTop: [10, 9, 9],
      expectedCutoff: 9,
    },
    {
      name: 'minCount = 0 → pure threshold filter',
      items: [10, 8, 7],
      threshold: 9,
      minCount: 0,
      expectedTop: [10],
      expectedCutoff: 9,
    },
    {
      name: 'fewer items than minCount',
      items: [10, 8],
      threshold: 9,
      minCount: 5,
      expectedTop: [10, 8],
      expectedCutoff: 8,
    },
    {
      name: 'empty input',
      items: [],
      threshold: 9,
      minCount: 3,
      expectedTop: [],
      expectedCutoff: 9,
    },
    {
      name: 'negatives and decimals',
      items: [-1.2, -3.4, 0.5],
      threshold: -2,
      minCount: 1,
      expectedTop: [0.5, -1.2],
      expectedCutoff: -2,
    },
  ].forEach(({ name, items, threshold, minCount, expectedTop, expectedCutoff }) => {
    it(name, () => {
      const top = takeTopWithMin(items, id, threshold, minCount)
      const cutoff = minCutoffForTopK(items, id, threshold, minCount)
      expect(top).toEqual(expectedTop)
      expect(cutoff).toBe(expectedCutoff)
    })
  })
})

describe('takeTopWithMin and minCutoffForTopK (objects) - explicit cases', () => {
  type Item = { v: number; id: string }
  const getValue = (x: Item) => x.v

  const items1: Item[] = [
    { v: 10, id: 'a' },
    { v: 9, id: 'b' },
    { v: 9, id: 'c' },
    { v: 8, id: 'd' },
  ]

  const items2: Item[] = [
    { v: 3, id: 'x' },
    { v: 1, id: 'y' },
    { v: 2, id: 'z' },
  ]

  ;(
    [
      {
        name: 'duplicates at cutoff (fallback)',
        items: items1,
        threshold: 9.5,
        minCount: 2,
        expectedIds: ['a', 'b'],
        expectedCutoff: 9,
      },
      {
        name: 'threshold equal to duplicate value',
        items: items1,
        threshold: 9,
        minCount: 2,
        expectedIds: ['a', 'b', 'c'],
        expectedCutoff: 9,
      },
      {
        name: 'fallback with fewer overall items than minCount',
        items: items2,
        threshold: 4,
        minCount: 5,
        expectedIds: ['x', 'z', 'y'],
        expectedCutoff: 1,
      },
      {
        name: 'minCount = 0 → pure threshold filter',
        items: items2,
        threshold: 2,
        minCount: 0,
        expectedIds: ['x', 'z'],
        expectedCutoff: 2,
      },
    ] as const
  ).forEach(({ name, items, threshold, minCount, expectedIds, expectedCutoff }) => {
    it(name, () => {
      const top = takeTopWithMin(items, getValue, threshold, minCount)
      const cutoff = minCutoffForTopK(items, getValue, threshold, minCount)
      expect(top.map((x) => x.id)).toEqual(expectedIds)
      expect(cutoff).toBe(expectedCutoff)
    })
  })
})
