import React from 'react'
import styled from 'styled-components'

import CompareValues from 'ui/src/CompareValues'

type Props = {
  isMobile?: boolean
  parsedVal: string
  title: string
  value: number | string | null | undefined
  valueCached: number | string | null | undefined
}

const HeaderStats = ({ isMobile, parsedVal, title, value, valueCached }: Props) => {
  return (
    <>
      {isMobile ? <Title>{title}</Title> : <DesktopTitle>{title}: </DesktopTitle>}
      <CompareValues prevVal={valueCached} newVal={value}>
        {parsedVal ? parsedVal : '-'}
      </CompareValues>
    </>
  )
}

const Title = styled.span`
  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
`

const DesktopTitle = styled.span`
  opacity: 0.7;
  margin-right: var(--spacing-1);
`

export default HeaderStats
