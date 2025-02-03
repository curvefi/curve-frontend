import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { ROUTE } from '@/loan/constants'
import useStore from '@/loan/store/useStore'

import InternalLink from '@ui/Link/InternalLink'
import TextCaption from '@ui/TextCaption'

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
