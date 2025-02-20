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
        let className = ''
        const tokenCount = idx + 1
        const isLast = tokenCount === totalCount

        if (tokenCount > iconsPerRow) {
          className += 'not-first-row'

          if (isOddCount && !isLast) {
            className += ' not-last'
          }
        }

        if (idx % iconsPerRow !== 0) {
          className += ' not-first'
        }

        return (
          <TokenIcon
            key={`${address}${idx}`}
            {...props}
            className={className}
            address={address}
            token={symbol}
            sx={{
              '&.not-first-row': {
                marginTop: '-6px',
              },

              '&.not-first': {
                marginLeft: '-4px',
              },

              '&.not-last': {
                position: 'relative',
                left: '8px',
              },
            }}
          />
        )
      })}
    </Box>
  )
}
