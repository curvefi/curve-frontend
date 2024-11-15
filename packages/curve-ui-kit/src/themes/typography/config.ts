import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { FIGMA_TOKENS, FigmaTokens } from '../model/figma-tokens.generated'

type HasPrefix<TPrefix extends string, TKey extends string> = TKey extends `${TPrefix}${string}` ? TKey : never

const filterEntriesWithKeyPrefix = <TPrefix extends string, TKey extends string, TValue>(prefix: TPrefix, typography: Record<TKey, TValue>) => (Object.fromEntries(Object.entries(typography)
  .filter(([key]) => key.startsWith(prefix))
) as Pick<typeof typography, HasPrefix<TPrefix, TKey>>)

export const typographyVariantsKeys = {
  heading: filterEntriesWithKeyPrefix('heading', FIGMA_TOKENS.typography),
  body: filterEntriesWithKeyPrefix('body', FIGMA_TOKENS.typography),
  buttonLabel: filterEntriesWithKeyPrefix('buttonLabel', FIGMA_TOKENS.typography),
  table: {
    header: filterEntriesWithKeyPrefix('tableHeader', FIGMA_TOKENS.typography),
    cell: filterEntriesWithKeyPrefix('tableCell', FIGMA_TOKENS.typography),
  },
  value: filterEntriesWithKeyPrefix('value', FIGMA_TOKENS.typography),
} as const

export const disabledTypographyKeys: (keyof TypographyOptions)[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'button',
  'body1',
  'body2',
  'caption',
  'overline',
  'subtitle1',
  'subtitle2',
] as const

export type TypographyVariantKey = keyof FigmaTokens['typography']

export type DisabledTypographyVariantKey = (typeof disabledTypographyKeys)[number]
