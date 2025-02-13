import type { TokenIconProps } from 'curve-ui-kit/src/shared/ui/TokenIcon'

import React from 'react'
import styled from 'styled-components'

export type TokensIconProps = {
  className?: string
  imageBaseUrl: string | null
  tokens: string[]
  tokenAddresses: string[]
  childComp(props: Omit<TokenIconProps, 'setTokenImage'>): React.JSX.Element
}

const TokensIcon = ({
  children,
  className = '',
  tokens,
  tokenAddresses,
  childComp: ChildComp,
  ...props
}: React.PropsWithChildren<TokensIconProps>) => {
  const totalCount = tokenAddresses.length
  const isOddCount = totalCount % 2 === 1
  const iconsPerRow = totalCount > 4 ? 3 : 2

  return (
    <Wrapper className={className} iconsPerRow={iconsPerRow} colSpan={isOddCount ? 2 : 1}>
      {tokenAddresses.map((address, idx) => {
        let className = ''
        const token = tokens[idx]
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

        return <ChildComp key={`${address}${idx}`} {...props} className={className} address={address} token={token} />
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
  min-width: 53px;

  ${({ iconsPerRow, colSpan }) => `
        grid-template-columns: repeat(${iconsPerRow}, auto);

        > *:nth-child(${iconsPerRow}n-1) {
          justify-self: center;
        }
      
        > *:nth-child(${iconsPerRow}n-1):nth-last-of-type(1) {
          grid-column: span ${colSpan};
        }
      `}

  > img {
    border: 1px solid transparent;
    border-radius: 50%;

    &.not-first-row {
      margin-top: -6px;
    }

    &.not-first {
      margin-left: -4px;
    }

    &.not-last {
      position: relative;
      left: 8px;
    }
  }
`

export default TokensIcon
