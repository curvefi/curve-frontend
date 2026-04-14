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

export function TokenIcons({ tokens, variant = 'default', ...props }: TokenIconsProps) {
  const totalCount = tokens.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2
  const colSpan = isOddCount ? 2 : 1
  const rowCount = Math.ceil(totalCount / iconsPerRow)
  const marginTop = { default: 6, icon: { 1: 4, 2: -8, 3: -11 }[rowCount] }[variant]
  const marginLeft = { default: 4, icon: { 1: -12, 2: -8, 3: -11 }[rowCount] }[variant]
  const lastRowOffset = { default: 8, icon: 3 }[variant]
  const size = ({ default: 'sm', icon: rowCount > 1 ? 'xs' : 'mui-sm' } as const)[variant]
  return (
    <Box
      data-testid="token-icons"
      data-data={JSON.stringify({ rowCount, marginTop, marginLeft, lastRowOffset, size })}
      display="inline-grid"
      sx={{
        gridTemplateColumns: `repeat(${iconsPerRow}, auto)`,
        [`& > *:nth-of-type(${iconsPerRow}n-1)`]: { justifySelf: 'center' },
        [`& > *:nth-of-type(${iconsPerRow}n-1):nth-last-of-type(1)`]: { gridColumn: `span ${colSpan}` },
      }}
    >
      {tokens.toReversed().map(({ address, symbol }, index) => {
        const isLast = index === totalCount - 1
        const isFirstRow = index < iconsPerRow && !(variant == 'icon' && isLast)
        const isFirstInRow = index % iconsPerRow === 0
        const shouldOffsetLastRowToken = isOddCount && !isLast && totalCount < 6 && !isFirstRow
        return (
          <TokenIcon
            key={`${address}${index}`}
            {...props}
            address={address}
            tooltip={symbol}
            size={size}
            sx={{
              // put the item back in their original place, since we used reverse to keep the first icons on top
              gridRow: Math.floor(index / iconsPerRow) + 1,
              gridColumn: (index % iconsPerRow) + 1,
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
