import InternalLink from '@/ui/Link/InternalLink'
import TextCaption from '@/ui/TextCaption'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import useStore from '@/store/useStore'


const TableCellMarketsTotalDebt = () => {
  const totalSupplyResp = useStore((state) => state.crvusdTotalSupply)

  const { total, minted, pegKeepersDebt, error } = totalSupplyResp ?? {}

  const formattedDebtFraction =
    total === '' && minted === '' ? '-' : formatNumber(((+total - +minted) / +total) * 100, FORMAT_OPTIONS.PERCENT)

  return (
    <>
      {typeof totalSupplyResp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <StyledTotalSupply>
          {formatNumber(pegKeepersDebt, { defaultValue: '-' })}
          <TextCaption>{formattedDebtFraction} of total supply</TextCaption>
        </StyledTotalSupply>
      )}
      <StyledLink $noStyles href={ROUTE.PAGE_PEGKEEPERS}>
        {t`View details`}
      </StyledLink>
    </>
  )
}

const StyledTotalSupply = styled.div`
  display: grid;
  grid-gap: 0.1rem;
`

const StyledLink = styled(InternalLink)`
  color: inherit;
  font-size: var(--font-size-2);
  margin-top: var(--spacing-2);
  text-transform: initial;
`

export default TableCellMarketsTotalDebt
