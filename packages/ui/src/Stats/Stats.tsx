import * as React from 'react'
import styled from 'styled-components'

type Props = {
  className?: string
  description?: string
  isAlignRight?: boolean
  isBorderBottom?: boolean
  isOneLine?: boolean
  label?: string | React.ReactNode
  children?: React.ReactNode
}

const Stats = ({
  className,
  description,
  isAlignRight,
  isBorderBottom,
  isOneLine,
  label,
  children,
}: React.PropsWithChildren<Props>) => {
  const classNames = `${className} stats`.trim()
  return (
    <DetailInfo
      isBorderBottom={isBorderBottom}
      isOneLine={isOneLine}
      isAlignRight={isAlignRight}
      className={classNames}
    >
      {label}
      <DetailValue className="detail">
        {description && <Description>{description}</Description>}
        {children || '-'}
      </DetailValue>
    </DetailInfo>
  )
}

export const Description = styled.p`
  font-size: var(--font-size-2);
  font-weight: 500;
`

const DetailValue = styled.div`
  flex-direction: column;
`

type DetailInfoProps = {
  isAlignRight?: boolean
  isBorderBottom?: boolean
  isOneLine?: boolean
}

const DetailInfo = styled.div<DetailInfoProps>`
  margin: 0.25rem 0 0 0;

  ${({ isAlignRight }) => {
    if (isAlignRight) {
      return 'text-align: right;'
    }
  }}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}

  ${DetailValue} {
    display: flex;
    justify-content: space-between;

    line-height: 1.5;
  }

  ${({ isOneLine }) => {
    if (isOneLine) {
      return `
        align-items: center;
        display: flex;
        flex-direction: row;
        column-gap: 1rem;
        justify-content: space-between;
      `
    }
  }}
`

export default Stats
