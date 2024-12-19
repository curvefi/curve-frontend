import { t } from '@lingui/macro'
import styled from 'styled-components'
import { useMemo } from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

type Props = {
  className?: string
  isMobile?: boolean
  rChainId: ChainId
  rOwmId: string
  market: OneWayMarketTemplate
}

const CellUtilizationTooltip = ({ className = '', isMobile, rChainId, rOwmId, market }: Props) => {
  const resp = useStore((state) => state.markets.statsCapAndAvailableMapper[rChainId]?.[rOwmId])
  const totalResp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { collateral_token, borrowed_token } = market ?? {}
  const { cap, available } = resp ?? {}
  const { totalDebt } = totalResp ?? {}

  const items = useMemo(
    () => [
      {
        label: t`Total ${collateral_token?.symbol ?? ''} Supplied`,
        content: formatNumber(cap, { notation: 'compact', defaultValue: '-' }),
      },
      {
        label: t`Total ${borrowed_token?.symbol ?? ''} Borrowed`,
        content: formatNumber(totalDebt, { notation: 'compact', defaultValue: '-' }),
      },
      {
        label: t`${borrowed_token?.symbol ?? ''} Available to Borrow`,
        content: formatNumber(available, { notation: 'compact', defaultValue: '-' }),
      },
    ],
    [available, borrowed_token?.symbol, cap, collateral_token?.symbol, totalDebt],
  )

  return (
    <Wrapper className={className ?? ''} $isMobile={isMobile}>
      <h3>{t`Utilization information`}</h3>
      <p>{t`Llamalend offers 2 types of markets: Mint and Pool Markets. Mint markets have a fixed cap determined by the DAO, while Pool markets are capped by the amount of liquidity provided.`}</p>

      <Items>
        {items.map(({ label, content }, idx) => (
          <Item key={`${label}${idx}`}>
            {label} <span>{content}</span>
          </Item>
        ))}
      </Items>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ $isMobile?: boolean }>`
  padding: var(--spacing-1);
  text-align: left;
  width: 290px;
`

const Items = styled.ul`
  margin-top: var(--spacing-2);
`

const Item = styled.li`
  display: flex;
  font-size: var(--font-size-1);
  justify-content: space-between;
`

export default CellUtilizationTooltip
