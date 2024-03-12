import styled from 'styled-components'

import TokenIcon from '@/components/TokenIcon'

type Props = {
  className?: string
  imageBaseUrl: string | null
  tokens: string[]
  tokenAddresses: string[]
}

const TokenIcons = ({ className, imageBaseUrl, tokens, tokenAddresses }: Props) => {
  const totalCount = tokenAddresses.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2

  return (
    <Wrapper className={className} iconsPerRow={iconsPerRow} colSpan={isOddCount ? 2 : 1}>
      {tokenAddresses.map((tokenAddress, idx) => {
        let className = ''
        let tokenCount = idx + 1
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
          <StyledTokenIcon
            key={`${tokenAddress}-${idx}`}
            className={className}
            imageBaseUrl={imageBaseUrl}
            address={tokenAddress}
            token={tokens[idx]}
          />
        )
      })}
    </Wrapper>
  )
}

TokenIcons.defaultProps = {
  className: '',
}

type TokenIconProps = {
  iconSize?: 'lg'
}

const StyledTokenIcon = styled(TokenIcon)<TokenIconProps>`
  border: 1px solid transparent;
  border-radius: 50%;

  &.not-first-row {
    margin-top: -4px;
  }

  &.not-first {
    margin-left: -3px;
  }

  &.not-last {
    position: relative;
    left: 8px;
  }
`

type WrapperProps = {
  iconsPerRow: number
  colSpan: number
}

const Wrapper = styled.div<WrapperProps>`
  display: inline-grid;
  min-width: 29px;

  ${({ iconsPerRow, colSpan }) => {
    return `
        grid-template-columns: repeat(${iconsPerRow}, auto);

        > *:nth-child(${iconsPerRow}n-1) {
          justify-self: center;
        }
      
        > *:nth-child(${iconsPerRow}n-1):nth-last-of-type(1) {
          grid-column: span ${colSpan};
        }
      `
  }}
`

export default TokenIcons
