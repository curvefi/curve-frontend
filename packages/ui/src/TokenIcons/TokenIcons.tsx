import { TokenIcon } from 'curve-ui-kit/src/shared/ui/TokenIcon'

import styled from 'styled-components'

type Props = {
  imageBaseUrl: string | null
  tokens: {
    symbol: string
    address: string
  }[]
}

export const TokenIcons = ({ tokens, ...props }: Props) => {
  const totalCount = tokens.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2

  return (
    <Wrapper iconsPerRow={iconsPerRow} colSpan={isOddCount ? 2 : 1}>
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
    </Wrapper>
  )
}

type WrapperProps = {
  iconsPerRow: number
  colSpan: number
}

const Wrapper = styled.div<WrapperProps>`
  display: inline-grid;
  //min-width: 53px;

  ${({ iconsPerRow, colSpan }) => `
        grid-template-columns: repeat(${iconsPerRow}, auto);

        > *:nth-child(${iconsPerRow}n-1) {
          justify-self: center;
        }
      
        > *:nth-child(${iconsPerRow}n-1):nth-last-of-type(1) {
          grid-column: span ${colSpan};
        }
      `}
`

export default TokenIcons
