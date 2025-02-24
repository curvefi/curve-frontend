import Box from '@mui/material/Box'
import { TokenIcon } from './TokenIcon'

type Props = {
  blockchainId: string
  tokens: {
    symbol: string
    address: string
  }[]
}

export function TokenIcons({ tokens, ...props }: Props) {
  const totalCount = tokens.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2
  const colSpan = isOddCount ? 2 : 1

  return (
    <Box
      display="inline-grid"
      sx={{
        gridTemplateColumns: `repeat(${iconsPerRow}, auto)`,
        [`& > *:nth-child(${iconsPerRow}n-1)`]: {
          justifySelf: 'center',
        },
        [`& > *:nth-child(${iconsPerRow}n-1):nth-last-of-type(1)`]: {
          gridColumn: `span ${colSpan}`,
        },
      }}
    >
      {tokens.map(({ address, symbol }, idx) => {
        const tokenCount = idx + 1
        const isLast = tokenCount === totalCount

        const isNotFirstRow = tokenCount > iconsPerRow
        const isNotFirstInRow = idx % iconsPerRow !== 0
        const shouldOffsetLastRowToken = isOddCount && !isLast && totalCount < 6 && isNotFirstRow

        return (
          <TokenIcon
            key={`${address}${idx}`}
            {...props}
            address={address}
            symbol={symbol}
            sx={{
              ...(isNotFirstRow && {
                marginTop: '-6px',
              }),
              ...(isNotFirstInRow && {
                marginLeft: '-4px',
              }),
              ...(shouldOffsetLastRowToken && {
                position: 'relative',
                left: '8px',
              }),
            }}
          />
        )
      })}
    </Box>
  )
}
