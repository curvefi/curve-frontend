import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'
import useVaultShares from '@/hooks/useVaultShares'

import Chip from '@/ui/Typography/Chip'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import ListInfoItem from '@/ui/ListInfo'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { ChainId } from '@/types/lend.types'

const CellUserMain = ({
  rChainId,
  rOwmId,
  userActiveKey,
  market,
  type,
}: {
  rChainId: ChainId
  rOwmId: string
  userActiveKey: string
  market: OneWayMarketTemplate
  type: 'borrow' | 'supply'
}) => {
  const { borrowed_token } = market ?? {}
  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { vaultShares = '0', gauge = '0', error: userBalancesError } = userBalancesResp ?? {}
  const { details, error } = resp ?? {}
  const totalVaultShares = +vaultShares + +gauge
  const { borrowedAmount, borrowedAmountUsd } = useVaultShares(rChainId, rOwmId, totalVaultShares)

  const value = type === 'borrow' ? formatNumber(details?.state?.debt) : borrowedAmount

  return (
    <ListInfoItem
      title={type === 'borrow' ? t`Debt` : t`Earning deposits`}
      titleDescription={type === 'borrow' ? `(${borrowed_token?.symbol})` : ''}
      mainValue={error || (type !== 'borrow' && userBalancesError) ? '?' : value}
    >
      <Wrapper>
        {type === 'borrow' ? (
          <InpChipUsdRate isBold hideRate address={borrowed_token?.address} amount={details?.state?.debt} />
        ) : (
          <Chip size="xs">
            {borrowedAmountUsd}
            <br />
            {formatNumber(totalVaultShares, { maximumSignificantDigits: 5 })} {t`vault shares`}
          </Chip>
        )}
      </Wrapper>
    </ListInfoItem>
  )
}

const Wrapper = styled.div`
  margin-top: 0.2rem;
`

export default CellUserMain
