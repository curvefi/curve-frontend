import { describe, expect, it } from 'vitest'
import { defineMarketTable, getColumnSettings, getColumnVisibility, inGroup } from './market-table'

const COLUMNS = [
  { id: 'assets', header: 'Assets', enableHiding: false },
  ...inGroup('Borrow', [
    { id: 'shown', header: 'Shown' },
    { id: 'hidden', header: 'Hidden', meta: { defaultHidden: true } },
  ]),
  ...inGroup('Lend', [{ id: 'lend', header: 'Lend APY' }]),
  ...inGroup('Borrow', [{ id: 'chart', header: 'Chart', meta: { defaultHidden: true } }]),
  { id: 'chain', filterFn: 'multi' },
]

describe('getColumnVisibility', () => {
  it('follows the column list without user overrides', () =>
    expect(getColumnVisibility(COLUMNS, {})).toEqual({
      assets: true,
      shown: true,
      hidden: false,
      lend: true,
      chart: false,
      chain: false,
    }))

  it('applies user overrides over the defaults', () =>
    expect(getColumnVisibility(COLUMNS, { shown: false, hidden: true })).toMatchObject({ shown: false, hidden: true }))

  it('ignores overrides for columns that cannot be toggled', () =>
    expect(getColumnVisibility(COLUMNS, { assets: false, chain: true })).toMatchObject({ assets: true, chain: false }))

  it('ignores overrides for columns that are not in the table', () =>
    expect(getColumnVisibility(COLUMNS, { removed: true })).not.toHaveProperty('removed'))
})

describe('getColumnSettings', () => {
  it('fails for a switch without a group', () =>
    expect(() => getColumnSettings([{ id: 'loose', header: 'Loose' }], {})).toThrow(
      'Column without settings group: loose',
    ))

  const toggles = (overrides = {}) =>
    getColumnSettings(COLUMNS, overrides).map(({ label, options }) => ({
      label,
      options: options.map(({ label, columns, active }) => ({ label, columns, active })),
    }))

  it('has one switch per column named after its header, grouped in order of appearance', () =>
    expect(toggles()).toEqual([
      {
        label: 'Borrow',
        options: [
          { label: 'Shown', columns: ['shown'], active: true },
          { label: 'Hidden', columns: ['hidden'], active: false },
          { label: 'Chart', columns: ['chart'], active: false },
        ],
      },
      { label: 'Lend', options: [{ label: 'Lend APY', columns: ['lend'], active: true }] },
    ]))

  it('agrees with the column visibility', () => {
    const overrides = { shown: false, chart: true }
    const visibility = getColumnVisibility(COLUMNS, overrides)
    toggles(overrides)
      .flatMap(({ options }) => options)
      .forEach(({ columns: [id], active }) => expect(active).toBe(visibility[id]))
  })
})

describe('stored settings migration', () => {
  const { migration } = defineMarketTable({
    testId: 'test',
    defaultSort: [],
    sortQueryField: 'sort',
    storageKey: 'Test',
    deprecatedVariants: ['hasPositions', 'noPositions'],
    columns: COLUMNS,
  })

  const stored = (options: { columns: string[]; active: boolean }[]) => [
    { options: options.map(option => ({ ...option, label: 'stored', enabled: true })) },
  ]

  it('starts empty without stored settings', () => expect(migration.migrate({})).toEqual({}))

  it('keeps only the overrides that differ from the defaults', () =>
    expect(
      migration.migrate({
        noPositions: stored([
          { columns: ['shown'], active: true },
          { columns: ['hidden'], active: true },
          { columns: ['lend'], active: false },
        ]),
      }),
    ).toEqual({ hidden: true, lend: false }))

  it('keeps overrides made with positions', () =>
    expect(
      migration.migrate({
        hasPositions: stored([{ columns: ['hidden'], active: true }]),
        noPositions: stored([{ columns: ['hidden'], active: false }]),
      }),
    ).toEqual({ hidden: true }))

  it('keeps overrides made without positions', () =>
    expect(
      migration.migrate({
        hasPositions: stored([{ columns: ['shown'], active: true }]),
        noPositions: stored([{ columns: ['shown'], active: false }]),
      }),
    ).toEqual({ shown: false }))

  it('ignores variants the table did not use', () =>
    expect(migration.migrate({ Borrow: stored([{ columns: ['shown'], active: false }]) })).toEqual({}))

  it('splits a setting stored for several columns', () =>
    expect(migration.migrate({ noPositions: stored([{ columns: ['hidden', 'chart'], active: true }]) })).toEqual({
      hidden: true,
      chart: true,
    }))

  it('drops columns that are not toggles of the table', () =>
    expect(
      migration.migrate({
        noPositions: stored([
          { columns: ['assets'], active: false },
          { columns: ['userHealth'], active: true },
        ]),
      }),
    ).toEqual({}))
})
