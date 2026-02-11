import assert from 'node:assert/strict'
import test from 'node:test'
import { createBuildContext, resolveLeafValue } from '../core.ts'
import type { ThemeName, TokenNode } from '../types.ts'

const mkThemeMap = (name: ThemeName): Map<string, TokenNode> =>
  new Map([
    ['B.Path', { path: 'B.Path', type: 'color', value: '#000000' }],
    ['A.Path', { path: 'A.Path', type: 'color', value: `{Ref.${name}}` }],
    [`Ref.${name}`, { path: `Ref.${name}`, type: 'color', value: '#ffffff' }],
  ])

void test('createBuildContext pre-sorts theme paths and caches resolvers', () => {
  const resolved = {
    light: mkThemeMap('light'),
    dark: mkThemeMap('dark'),
    chad: mkThemeMap('chad'),
  }

  const context = createBuildContext(new Map(), resolved)

  assert.deepEqual(context.themes.light.sortedPaths, ['A.Path', 'B.Path', 'Ref.light'])
  assert.equal(resolveLeafValue(context.themes.light.resolver, 'a.path'), '#ffffff')
})

void test('build context includes all required themes', () => {
  const resolved = {
    light: mkThemeMap('light'),
    dark: mkThemeMap('dark'),
    chad: mkThemeMap('chad'),
  }

  const context = createBuildContext(new Map(), resolved)
  assert.deepEqual(Object.fromEntries(Object.entries(context.themes).map(([key, theme]) => [key, theme.name])), {
    light: 'light',
    dark: 'dark',
    chad: 'chad',
  })
})
