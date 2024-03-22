import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { CURVE_FI_ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import { RCExternal } from '@/images'
import Box from '@/ui/Box'
import CellMarketsTotalDebt from '@/components/PageMarketList/components/TableCellMarketsTotalDebt'
import ExternalLink from '@/ui/Link/ExternalLink'

const TableStats = () => {
  const isXSmDown = useStore((state) => state.layout.isXSmDown)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)

  const cellProps = {
    size: 'md' as const,
    isBold: !isXSmDown,
  }

  const stats = [
    { title: t`PegKeepers Debt`, content: <CellMarketsTotalDebt {...cellProps} type="peg-keeper-debt" /> },
    { title: t`Debt Fraction`, content: <CellMarketsTotalDebt {...cellProps} type="debt-fraction" /> },
    {
      title: t`crvUSD Pools`,
      content: (
        <StyledExternalLink href={CURVE_FI_ROUTE.CRVUSD_POOLS}>
          {t`View pools`} <RCExternal />
        </StyledExternalLink>
      ),
    },
  ]

  return (
    <>
      {isAdvanceMode && (
        <Wrapper>
          <ContentStatsTitle>Markets Details</ContentStatsTitle>
          <ContentStats flex gridColumnGap={2}>
            {stats.map(({ title, content }) => {
              return (
                <ContentStat key={title}>
                  <ContentStatTitle>{title}</ContentStatTitle>
                  {content}
                </ContentStat>
              )
            })}
          </ContentStats>
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  padding-top: var(--spacing-wide);
  padding-right: var(--spacing-narrow);
  padding-left: var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: 0;
    padding-right: 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    padding: var(--spacing-wide) 0 0 0;
  }
`

const ContentStats = styled(Box)`
  display: flex;
  flex-direction: column;

  @media (min-width: ${breakpoints.sm}rem) {
    display: block;
    margin: var(--spacing-narrow) 0;
    min-height: 47px;
  }
`

const ContentStatsTitle = styled.h3`
  margin-bottom: var(--spacing-narrow);
`

const ContentStat = styled.span`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: var(--spacing-1);
  margin-top: var(--spacing-1);

  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-start;
    border: 1px solid var(--border-400);
    display: inline-flex;
    flex-direction: column;
    margin-right: var(--spacing-2);
    min-height: 2.9375rem; // 47px
    padding: var(--spacing-1) var(--spacing-2);
    width: auto;
  }
`

const ContentStatTitle = styled.span`
  @media (min-width: ${breakpoints.sm}rem) {
    font-size: var(--font-size-1);
    font-weight: bold;
    margin-bottom: var(--spacing-1);
    text-transform: uppercase;
  }
`

const StyledExternalLink = styled(ExternalLink)`
  text-transform: initial;
  font-size: var(--font-size-2);
  font-weight: bold;
`

export default TableStats
