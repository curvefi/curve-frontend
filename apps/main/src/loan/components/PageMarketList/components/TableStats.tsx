import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'

import CellMarketsTotalDebt from '@/components/SharedCells/TableCellMarketsTotalDebt'
import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const TableStats = () => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const stats = [{ title: t`PegKeepers Debt`, content: <CellMarketsTotalDebt /> }]

  return (
    <>
      {isAdvancedMode && (
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
