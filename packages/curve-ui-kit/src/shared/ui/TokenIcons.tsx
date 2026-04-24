import Box from '@mui/material/Box'
import { TokenIcon } from './TokenIcon'

export type TokenIconsProps = {
  blockchainId: string
  tokens: {
    symbol: string
    address: string
  }[]
  variant?: TokenIconsVariant
}

export type TokenIconsVariant = 'default' | 'icon'

/**
 * TokenIcons component displays a list of tokens in a grid layout.
 * The tokens are arranged in rows of 2 or 3, with some overlap between them. Variants:
 * - 'default': Displays the tokens in a grid with a default size and flexible total size
 * - 'icon': Displays smaller tokens, tighter spacing, and fixed 20px total size
 */
export function TokenIcons({ tokens, variant = 'default', ...props }: TokenIconsProps) {
  const totalCount = tokens.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2
  const rowCount = Math.ceil(totalCount / iconsPerRow)
  const marginTop = { default: -6, icon: { 1: 4, 2: -8, 3: -11 }[rowCount] }[variant]
  const marginLeft = { default: -4, icon: { 1: -12, 2: -8, 3: -11 }[rowCount] }[variant]
  const lastRowOffset = { default: 8, icon: 3 }[variant]
  const isIconVariant = variant === 'icon'
  const displayTokens = isIconVariant ? tokens.toReversed() : tokens

  return (
    <Box
      data-testid="token-icons"
      display="inline-grid"
      sx={{
        gridTemplateColumns: `repeat(${iconsPerRow}, auto)`,
        [`& > *:nth-of-type(${iconsPerRow}n-1)`]: { justifySelf: 'center' },
        [`& > *:nth-of-type(${iconsPerRow}n-1):nth-last-of-type(1)`]: { gridColumn: `span ${isOddCount ? 2 : 1}` },
      }}
    >
      {displayTokens.map(({ address, symbol }, index) => {
        const tokenCount = index + 1
        const isLast = isIconVariant ? index === totalCount - 1 : tokenCount === totalCount
        const isFirstRow = isIconVariant ? index < iconsPerRow && !isLast : tokenCount <= iconsPerRow
        const isFirstInRow = index % iconsPerRow === 0
        const shouldOffsetLastRowToken = isOddCount && !isLast && totalCount < 6 && !isFirstRow

        return (
          <TokenIcon
            key={`${address}${index}`}
            {...props}
            address={address}
            tooltip={symbol}
            size={({ default: 'sm', icon: rowCount > 1 ? 'xs' : 'mui-sm' } as const)[variant]}
            sx={{
              zIndex: isIconVariant ? index : totalCount - index, // first token renders on top for default, reverse order for icon
              ...(isIconVariant && {
                // put the item back in their original place, since we used reverse to keep the first icons on top
                gridRow: Math.floor(index / iconsPerRow) + 1,
                gridColumn: (index % iconsPerRow) + 1,
              }),
              ...(!isFirstRow && { marginTop: `${marginTop}px` }),
              ...(!isFirstInRow && { marginLeft: `${marginLeft}px` }),
              ...(shouldOffsetLastRowToken && { position: 'relative', left: `${lastRowOffset}px` }),
            }}
          />
        )
      })}
    </Box>
  )
}
