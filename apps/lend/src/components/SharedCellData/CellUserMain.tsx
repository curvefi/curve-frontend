import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'
import useVaultShares from '@/hooks/useVaultShares'

import Chip from '@/ui/Typography/Chip'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import TextCaption from '@/ui/TextCaption'

const CellUserMain = ({
  rChainId,
  rOwmId,
  userActiveKey,
  owmDataCachedOrApi,
  type,
}: {
  rChainId: ChainId
  rOwmId: string
  userActiveKey: string
  owmDataCachedOrApi: OWMDataCacheOrApi
  type: 'borrow' | 'supply'
}) => {
  const { borrowed_token } = owmDataCachedOrApi?.owm ?? {}
  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { vaultShares = '0', gauge = '0', error: userBalancesError } = userBalancesResp ?? {}
  const { details, error } = resp ?? {}
  const totalVaultShares = +vaultShares + +gauge
  const { borrowedAmount, borrowedAmountUsd } = useVaultShares(rChainId, rOwmId, totalVaultShares)

  const label = type === 'borrow' ? t`Debt (${borrowed_token?.symbol})` : t`Earning deposits`
  const value = type === 'borrow' ? formatNumber(details?.state?.debt) : borrowedAmount

  return (
    <Wrapper>
      <TextCaption isBold isCaps>
        {label}
      </TextCaption>
      <TextValue>{error || (type !== 'borrow' && userBalancesError) ? '?' : value}</TextValue>

      {type === 'borrow' ? (
        <InpChipUsdRate isBold hideRate address={borrowed_token?.address} amount={details?.state?.debt} />
      ) : (
        <Chip>
          {borrowedAmountUsd}
          <br />
          {formatNumber(totalVaultShares, { maximumSignificantDigits: 5 })} {t`vault shares`}
        </Chip>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border: 1px solid var(--nav_button--border-color);
  display: grid;
  padding: var(--spacing-narrow);
  margin-bottom: var(--spacing-normal);
`

export const TextValue = styled.span`
  font-size: var(--font-size-6);
  font-weight: bold;
  margin-bottom: var(--spacing-1);
`

export default CellUserMain
