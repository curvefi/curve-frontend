import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'
import { IconStack } from './IconStack'
import { TokenIcon } from './TokenIcon'

const { IconSize } = SizesAndSpaces

type TokenPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'bottomCenter'
type TokenIconsSize = Extract<keyof typeof IconSize, 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | '4xl'>
type TokenIconsOverflowMode = 'counter' | 'stack'

const TOKEN_POSITIONS = {
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { right: 0, bottom: 0 },
  bottomCenter: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
} as const satisfies Record<TokenPosition, object>

const TOKEN_LAYOUTS = {
  2: ['topLeft', 'bottomRight'],
  3: ['topLeft', 'topRight', 'bottomCenter'],
  4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  overflow: ['topLeft', 'topRight', 'bottomLeft'],
} as const satisfies Record<2 | 3 | 4 | 'overflow', readonly TokenPosition[]>

const TOKEN_SIZE = 'calc(2 * 100% / 3)' as const // The size of each token icon relative to the overall TokenIcons component.
const OVERFLOW_SIZE = '60%' as const // The size of the overflow counter relative to the overall TokenIcons component. This is slightly smaller than the token icons to make it visually distinct.
const STACK_ICON_SIZE = {
  md: 'xs',
  lg: 'sm',
  xl: 'lg',
  xxl: 'lg',
  '3xl': 'xl',
  '4xl': '3xl',
} as const satisfies Record<TokenIconsSize, keyof typeof IconSize>

export type TokenIconsProps = {
  blockchainId: string
  tokens: { symbol: string; address: string }[]
  /** Size of the complete token group, not the individual token icons. */
  size?: TokenIconsSize
  showChainIcon?: boolean
  /** How to render token collections containing more than four tokens. */
  overflowMode?: TokenIconsOverflowMode
}

/**
 * Renders token icons in a layout determined by the number of tokens:
 *
 * | Tokens | Behavior |
 * | --- | --- |
 * | 1 | A single `TokenIcon`. |
 * | 2 | The overlapping `TokenPair` layout. |
 * | 3 | An inverted token pyramid, with the third token centered on a new row. |
 * | 4 | A 2x2 grid of four tokens. |
 * | 5 or more | A 2x2 grid containing three tokens and a box showing how many additional tokens are hidden. |
 *
 * When `overflowMode` is `stack`, collections of five or more tokens are rendered as an `IconStack` instead.
 */
export function TokenIcons({
  blockchainId,
  tokens,
  size = 'xl',
  showChainIcon = false,
  overflowMode = 'counter',
}: TokenIconsProps) {
  // Trivial base case of zero tokens.
  if (tokens.length === 0) {
    return null
  }

  // With only one token we fall back to a normal TokenIcon, but can't directly set the size property, that's for a later refactor.
  if (tokens.length === 1) {
    const [{ address, symbol }] = tokens
    return (
      <TokenIcon
        blockchainId={blockchainId}
        address={address}
        tooltip={symbol}
        showChainIcon={showChainIcon}
        sx={{ width: IconSize[size], height: IconSize[size] }}
      />
    )
  }

  const hasOverflow = tokens.length > 4

  // When we're overflowing it's worth first checking if the we show simply use an icon stack instead of the counter layout.
  if (hasOverflow && overflowMode === 'stack') {
    return (
      <IconStack iconSize={STACK_ICON_SIZE[size]}>
        {tokens.map(({ address, symbol }, index) => (
          <TokenIcon
            key={address}
            blockchainId={blockchainId}
            address={address}
            tooltip={symbol}
            showChainIcon={showChainIcon && index === 0}
            sx={{
              width: IconSize[STACK_ICON_SIZE[size]],
              height: IconSize[STACK_ICON_SIZE[size]],
              zIndex: index + 1, // Without it the the first token may be on top of the second one when a chain icon is shown as it's in a position relative box
            }}
          />
        ))}
      </IconStack>
    )
  }

  // We now fall back to the counter layout, which is used for 2-4 tokens and 5+ tokens when overflowMode is 'counter'.
  const displayedTokens = hasOverflow ? tokens.slice(0, 3) : tokens
  const positions = TOKEN_LAYOUTS[tokens.length > 4 ? 'overflow' : (tokens.length as 2 | 3 | 4)]

  return (
    <Box data-testid="token-icons" sx={{ position: 'relative', width: IconSize[size], height: IconSize[size] }}>
      {displayedTokens.map(({ address, symbol }, index) => (
        // Wrapper box is needed because positioning TokenIcon directly breaks when the optional chain icon adds an extra wrapper.
        <Box
          key={address}
          sx={{
            position: 'absolute',
            width: TOKEN_SIZE,
            height: TOKEN_SIZE,
            zIndex: index + 1,
            ...TOKEN_POSITIONS[positions[index]],
          }}
        >
          <TokenIcon
            blockchainId={blockchainId}
            address={address}
            tooltip={symbol}
            showChainIcon={showChainIcon && index === 0}
            sx={{ width: '100%', height: '100%' }}
          />
        </Box>
      ))}

      {hasOverflow && (
        <Box
          data-testid="token-icons-extra-count"
          sx={{
            position: 'absolute',
            width: OVERFLOW_SIZE,
            height: OVERFLOW_SIZE,
            zIndex: displayedTokens.length + 1,
            ...TOKEN_POSITIONS.bottomRight,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: t => t.design.Layer[2].Fill,
            border: borderStyle,
            userSelect: 'none',
          }}
        >
          <Typography variant={size === 'md' ? 'buttonXxs' : 'buttonXs'} color="textPrimary">
            +{size !== 'md' && tokens.length - displayedTokens.length}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
