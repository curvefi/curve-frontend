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
  it('follows the column list without user choices', () =>
    expect(getColumnVisibility(COLUMNS, {})).toEqual({
      assets: true,
      shown: true,
      hidden: false,
      lend: true,
      chart: false,
      chain: false,
    }))

  it('applies user choices over the defaults', () =>
    expect(getColumnVisibility(COLUMNS, { shown: false, hidden: true })).toMatchObject({ shown: false, hidden: true }))

  it('ignores choices for columns that cannot be toggled', () =>
    expect(getColumnVisibility(COLUMNS, { assets: false, chain: true })).toMatchObject({ assets: true, chain: false }))

  it('ignores choices for columns that are not in the table', () =>
    expect(getColumnVisibility(COLUMNS, { removed: true })).not.toHaveProperty('removed'))
})

describe('getColumnSettings', () => {
  const toggles = (choices = {}) =>
    getColumnSettings(COLUMNS, choices).map(({ label, options }) => ({
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
    const choices = { shown: false, chart: true }
    const visibility = getColumnVisibility(COLUMNS, choices)
    toggles(choices)
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
    storedVariant: 'noPositions',
    columns: COLUMNS,
  })

  const migrate = (options: { columns: string[]; active: boolean }[]) =>
    migration.migrate({
      noPositions: [{ options: options.map(option => ({ ...option, label: 'stored', enabled: true })) }],
      hasPositions: [{ options: [{ columns: ['shown'], active: false, label: 'other variant', enabled: true }] }],
    })

  it('keeps only the choices of its variant that differ from the defaults', () =>
    expect(
      migrate([
        { columns: ['shown'], active: true },
        { columns: ['hidden'], active: true },
        { columns: ['lend'], active: false },
      ]),
    ).toEqual({ hidden: true, lend: false }))

  it('splits a choice stored for several columns', () =>
    expect(migrate([{ columns: ['hidden', 'chart'], active: true }])).toEqual({ hidden: true, chart: true }))

  it('drops columns that are not toggles of the table', () =>
    expect(
      migrate([
        { columns: ['assets'], active: false },
        { columns: ['userHealth'], active: true },
      ]),
    ).toEqual({}))

  it('starts empty without stored settings', () => expect(migration.migrate({})).toEqual({}))
})
