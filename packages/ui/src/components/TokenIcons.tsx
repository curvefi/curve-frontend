import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { IconStack } from '@ui/components/IconStack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui/lib/mui'
import { getTokenPairUnit, UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { TokenIcon, type TokenPairAddresses } from './TokenIcon'

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

type IconToken = { symbol?: string | null; address: string }

/** A token, or a token pair shown as a single split icon (e.g. the coins of an LP token) */
export type TokenOrPair = IconToken | [IconToken, IconToken]

/** Merges a token pair into the address, symbol and key of a single split icon */
const toIconToken = (token: TokenOrPair) => {
  if (!Array.isArray(token)) return { ...token, symbol: token?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL, key: token.address }
  const [first, second] = token
  const address: TokenPairAddresses = [first.address, second.address]
  return { address, symbol: getTokenPairUnit([first.symbol, second.symbol]), key: address.join('-') }
}

export type TokenIconsProps = {
  blockchainId: string
  tokens: TokenOrPair[] | undefined
  /** Size of the complete token group, not the individual token icons. */
  size?: TokenIconsSize
  showChainIcon?: boolean
  showTooltips?: boolean
  /** How to render token collections containing more than four tokens. */
  overflowMode?: TokenIconsOverflowMode
}

/**
 * Renders token icons in a layout determined by the number of tokens:
 *
 * | Tokens | Behavior |
 * | --- | --- |
 * | 1 | A single `TokenIcon`. |
 * | 2 | Two overlapping tokens. |
 * | 3 | An inverted token pyramid, with the third token centered on a new row. |
 * | 4 | A 2x2 grid of four tokens. |
 * | 5 or more | A 2x2 grid containing three tokens and a box showing how many additional tokens are hidden. |
 *
 * When `overflowMode` is `stack`, collections of five or more tokens are rendered as an `IconStack` instead.
 * A token pair takes one slot and is rendered as a single split icon.
 */
export function TokenIcons({
  blockchainId,
  tokens = [],
  size = 'xl',
  showChainIcon = false,
  showTooltips = true,
  overflowMode = 'counter',
}: TokenIconsProps) {
  // Trivial base case of zero tokens.
  if (tokens.length === 0) {
    return null
  }

  const iconTokens = tokens.map(toIconToken)

  // With only one token we fall back to a normal TokenIcon, but can't directly set the size property, that's for a later refactor.
  if (tokens.length === 1) {
    const [{ address, symbol }] = iconTokens
    return (
      <TokenIcon
        blockchainId={blockchainId}
        address={address}
        {...(showTooltips && symbol && { tooltip: symbol })}
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
        {iconTokens.map(({ address, symbol, key }, index) => (
          <TokenIcon
            key={key}
            blockchainId={blockchainId}
            address={address}
            {...(showTooltips && symbol && { tooltip: symbol })}
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
  const displayedTokens = hasOverflow ? iconTokens.slice(0, 3) : iconTokens
  const positions = TOKEN_LAYOUTS[tokens.length > 4 ? 'overflow' : (tokens.length as 2 | 3 | 4)]

  return (
    <Box data-testid="token-icons" sx={{ position: 'relative', width: IconSize[size], height: IconSize[size] }}>
      {displayedTokens.map(({ address, symbol, key }, index) => (
        // Wrapper box is needed because positioning TokenIcon directly breaks when the optional chain icon adds an extra wrapper.
        <Box
          key={key}
          sx={{
            position: 'absolute',
            width: TOKEN_SIZE,
            height: TOKEN_SIZE,
            // Exception here is that for token pairs we want to render the first token over the second one
            zIndex: tokens.length === 2 ? 2 - index : index + 1,
            ...TOKEN_POSITIONS[positions[index]],
          }}
        >
          <TokenIcon
            blockchainId={blockchainId}
            address={address}
            {...(showTooltips && symbol && { tooltip: symbol })}
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
