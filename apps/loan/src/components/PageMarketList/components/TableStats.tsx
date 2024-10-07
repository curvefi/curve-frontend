import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'
import { breakpoints } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import CellMarketsTotalDebt from '@/components/PageMarketList/components/TableCellMarketsTotalDebt'
import useStore from '@/store/useStore'


const TableStats = () => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)

  const stats = [{ title: t`PegKeepers Debt`, content: <CellMarketsTotalDebt /> }]

  return (
    <>
      {isAdvanceMode && (
        <Wrapper>
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
