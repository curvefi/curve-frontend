import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { CURVE_FI_ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import { RCExternal } from '@/images'
import CellMarketsTotalDebt from '@/components/PageMarketList/components/TableCellMarketsTotalDebt'
import ExternalLink from '@/ui/Link/ExternalLink'
import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'

const TableStats = () => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)

  const stats = [
    { title: t`PegKeepers Debt`, content: <CellMarketsTotalDebt /> },
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
          <StyledListInfoItems>
            {stats.map(({ title, content }, idx) => (
              <StyledListInfoItem key={`info-${idx}`} title={title}>
                {content}
              </StyledListInfoItem>
            ))}
          </StyledListInfoItems>
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

const ContentStatsTitle = styled.h3`
  margin-bottom: var(--spacing-narrow);
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  text-transform: initial;
  font-size: var(--font-size-2);
  font-weight: bold;

  :hover {
    color: var(--link--color);
  }
`

const StyledListInfoItems = styled(ListInfoItems)`
  > li:not(:last-of-type) {
    margin-right: var(--spacing-normal);
  }
`

const StyledListInfoItem = styled(ListInfoItem)`
  border: 1px solid var(--border-400);
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-1);
`

export default TableStats
