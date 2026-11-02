import { describe, expect, it } from 'vitest'
import { getColumnSettings, getColumnVisibility, inGroup, migrateGroupsToChoices } from './market-table'

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

describe('migrateGroupsToChoices', () => {
  const stored = (options: { columns: string[]; active: boolean }[]) => [
    { options: options.map(option => ({ ...option, label: 'stored', enabled: true })) },
  ]

  it('keeps only the choices that differ from the defaults', () =>
    expect(
      migrateGroupsToChoices(
        stored([
          { columns: ['shown'], active: true },
          { columns: ['hidden'], active: true },
          { columns: ['lend'], active: false },
        ]),
        COLUMNS,
      ),
    ).toEqual({ hidden: true, lend: false }))

  it('splits a choice stored for several columns', () =>
    expect(migrateGroupsToChoices(stored([{ columns: ['hidden', 'chart'], active: true }]), COLUMNS)).toEqual({
      hidden: true,
      chart: true,
    }))

  it('drops columns that are not toggles of the table', () =>
    expect(
      migrateGroupsToChoices(
        stored([
          { columns: ['assets'], active: false },
          { columns: ['userHealth'], active: true },
        ]),
        COLUMNS,
      ),
    ).toEqual({}))

  it('starts empty without stored settings', () => expect(migrateGroupsToChoices(undefined, COLUMNS)).toEqual({}))
})
