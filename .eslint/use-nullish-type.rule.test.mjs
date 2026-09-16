import assert from 'node:assert/strict'
import { Linter, RuleTester } from 'eslint'
import parser from '@typescript-eslint/parser'
import { useNullishTypeRule } from './use-nullish-type.rule.mjs'

const ruleTester = new RuleTester({ languageOptions: { parser } })

ruleTester.run('use-nullish-type', useNullishTypeRule, {
  valid: [
    'type Value = string | Nullish',
    'type Value = string | null',
    'type Value = string | undefined',
    'type Value = null | void',
    'type Value = { a: null } | { b: undefined }',
    'type Value = null | undefined[]',
    'type Value = [null, undefined]',
    'const value = null || undefined',
    '// eslint-disable-next-line rule-to-test/use-nullish-type\ntype Nullish = null | undefined',
  ],
  invalid: [
    ...[
      ['type Value = null | undefined', 'type Value = Nullish'],
      ['type Value = undefined | null', 'type Value = Nullish'],
      ['type Value = null | string | undefined', 'type Value = Nullish | string'],
      ['type Value = string | (null | undefined)', 'type Value = string | Nullish'],
      ['type Value = (string | null) | undefined', 'type Value = string | Nullish'],
      ['type Value = (null | undefined)[]', 'type Value = (Nullish)[]'],
      ['type Value = Promise<null | undefined>', 'type Value = Promise<Nullish>'],
      ['type Value = { value: string | null | undefined }', 'type Value = { value: string | Nullish }'],
      ['type Value = (() => string) | null | undefined', 'type Value = (() => string) | Nullish'],
    ].map(([code, output]) => ({
      code,
      output: `import type { Nullish } from '@primitives/objects.utils'\n${output}`,
    })),
    { code: 'type Nullish = null | undefined', output: null },
    { code: 'type Value<Nullish> = null | undefined', output: null },
    { code: 'type Value = null /* reason */ | undefined', output: null },
    {
      code: "import type { Nullish as Empty } from '@primitives/objects.utils'\ntype Value = null | undefined",
      output: "import type { Nullish as Empty } from '@primitives/objects.utils'\ntype Value = Empty",
    },
    {
      code: "import { maybe } from '@primitives/objects.utils'\ntype Value = null | undefined",
      output: "import { type Nullish, maybe } from '@primitives/objects.utils'\ntype Value = Nullish",
    },
    {
      code: "import type { Falsy } from '@primitives/objects.utils'\ntype Value = null | undefined",
      output: "import type { Nullish, Falsy } from '@primitives/objects.utils'\ntype Value = Nullish",
    },
    {
      filename: '/repo/packages/primitives/src/nested/example.ts',
      code: 'type Value = null | undefined',
      output: "import type { Nullish } from '../objects.utils'\ntype Value = Nullish",
    },
    {
      filename: '/repo/packages/primitives/src/objects.utils.ts',
      code: '// eslint-disable-next-line rule-to-test/use-nullish-type\nexport type Nullish = null | undefined\ntype Value = null | undefined',
      output:
        '// eslint-disable-next-line rule-to-test/use-nullish-type\nexport type Nullish = null | undefined\ntype Value = Nullish',
    },
    {
      code: "import type { Nullish as Empty } from '@primitives/objects.utils'\ntype Value<Empty> = null | undefined",
      output: null,
    },
  ].map(test => ({ ...test, errors: [{ messageId: 'useNullish' }] })),
})

const linter = new Linter()
const result = linter.verifyAndFix('type A = null | undefined\ntype B = string | undefined | null', {
  languageOptions: { parser },
  plugins: { local: { rules: { 'use-nullish-type': useNullishTypeRule } } },
  rules: { 'local/use-nullish-type': 'error' },
})
assert.deepEqual(result.messages, [])
assert.equal(
  result.output,
  "import type { Nullish } from '@primitives/objects.utils'\ntype A = Nullish\ntype B = string | Nullish",
)
