import assert from 'node:assert/strict'
import test from 'node:test'
import { createBuildContext } from '../core.ts'
import { mergeColorOnlyThemeTokens } from '../pipelines/theme-tokens.ts'
import { buildTypographyVariants } from '../pipelines/typography.ts'
import type { TokenNode } from '../types.ts'

const themeMap = () =>
  new Map<string, TokenNode>([
    [
      'Body.MRegular',
      {
        path: 'Body.MRegular',
        type: 'typography',
        value: {
          fontFamily: '{Text.FontFamily.Heading}',
          fontWeight: '{Typography.FontWeight.Medium}',
          fontSize: '{Typography.FontSize.M}',
          lineHeight: '{Typography.LineHeight.M}',
        },
      },
    ],
    ['Typography.FontWeight.Medium', { path: 'Typography.FontWeight.Medium', type: 'fontWeight', value: '500' }],
    ['Typography.FontSize.M', { path: 'Typography.FontSize.M', type: 'dimension', value: '16' }],
    ['Typography.LineHeight.M', { path: 'Typography.LineHeight.M', type: 'dimension', value: '24' }],
  ])

void test('typography variants are source-driven', () => {
  const context = createBuildContext(new Map(), {
    light: themeMap(),
    dark: themeMap(),
    chad: themeMap(),
  })

  const sizesAndSpaces = {
    FontWeight: { Medium: 500 },
    FontSize: { M: { mobile: '16px', tablet: '16px', desktop: '16px' } },
    LineHeight: { M: { mobile: '24px', tablet: '24px', desktop: '24px' } },
  }

  const variants = buildTypographyVariants({}, context, sizesAndSpaces)

  assert.deepEqual(Object.keys(variants), ['bodyMRegular'])
  assert.deepEqual(variants.bodyMRegular, {
    fontFamily: 'Heading',
    fontWeight: 'Medium',
    fontSize: 'M',
    lineHeight: 'M',
  })
})

void test('mergeColorOnlyThemeTokens preserves non-color leaves and overlays color updates', () => {
  const merged = mergeColorOnlyThemeTokens(
    {
      light: { App: { Background: '#111111', Radius: '8px' } },
      dark: { App: { Background: '#222222', Radius: '8px' } },
      chad: { App: { Background: '#333333', Radius: '8px' } },
    },
    {
      light: { App: { Background: '#abcdef' } },
      dark: { App: { Background: '#fedcba' } },
      chad: { App: { Background: '#123456' } },
    },
  )

  assert.equal((merged.light.App as Record<string, unknown>).Background, '#abcdef')
  assert.equal((merged.light.App as Record<string, unknown>).Radius, '8px')
})
