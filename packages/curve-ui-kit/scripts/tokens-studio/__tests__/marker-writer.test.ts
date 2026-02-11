import assert from 'node:assert/strict'
import test from 'node:test'
import { readMarkerObjectFromSource, renderConstDeclaration } from '../marker-writer.ts'

const normalizeMarkerValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((item) => normalizeMarkerValue(item))
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => [key, normalizeMarkerValue(child)] as const)
      .sort(([a], [b]) => a.localeCompare(b)),
  )
}

const areMarkerValuesSemanticallyEqual = (a: unknown, b: unknown): boolean =>
  JSON.stringify(normalizeMarkerValue(a)) === JSON.stringify(normalizeMarkerValue(b))

void test('semantic compare ignores key order differences', () => {
  const a = { b: 2, a: { y: 2, x: 1 } }
  const b = { a: { x: 1, y: 2 }, b: 2 }
  assert.equal(areMarkerValuesSemanticallyEqual(a, b), true)
})

void test('readMarkerObjectFromSource parses marker const and preserves expressions', () => {
  const source = `\n/* BEGIN */\nconst Example = { a: 1, b: Foo['x'] } as const\n/* END */\n`
  const value = readMarkerObjectFromSource(source, 'x.ts', 'Example', '/* BEGIN */', '/* END */')
  assert.deepEqual(value, {
    a: 1,
    b: "__TOKENS_STUDIO_EXPR__:Foo['x']",
  })
})

void test('render + parse are semantically idempotent', () => {
  const input = {
    z: { b: 2, a: 1 },
    color: "__TOKENS_STUDIO_EXPR__:Blues['500']",
  }

  const rendered = renderConstDeclaration('Example', input, false)
  const source = `/* BEGIN */\n${rendered}\n/* END */`
  const reparsed = readMarkerObjectFromSource(source, 'x.ts', 'Example', '/* BEGIN */', '/* END */')

  assert.equal(areMarkerValuesSemanticallyEqual(input, reparsed), true)
})
