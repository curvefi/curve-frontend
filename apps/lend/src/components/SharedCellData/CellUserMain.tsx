import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import InpChipUsdRate from '@/components/InpChipUsdRate'
import InpChipVaultShareUsdRate from '@/components/InpChipVaultShareUsdRate'
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
  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { borrowed_token } = owmDataCachedOrApi?.owm ?? {}
  const { vaultShares = '0', gauge = '0', error: userBalancesError } = userBalancesResp ?? {}
  const { details, error } = resp ?? {}
  const totalVaultShares = +vaultShares + +gauge

  const label = type === 'borrow' ? t`Debt (${borrowed_token?.symbol})` : t`Vault shares`
  const value = type === 'borrow' ? formatNumber(details?.state?.debt) : formatNumber(totalVaultShares)

  return (
    <Wrapper>
      <TextCaption isBold isCaps>
        {label}
      </TextCaption>
      <TextValue>{error ? '?' : value}</TextValue>

      {type === 'borrow' ? (
        <InpChipUsdRate isBold hideRate address={borrowed_token?.address} amount={details?.state?.debt} />
      ) : (
        <InpChipVaultShareUsdRate noPadding rChainId={rChainId} rOwmId={rOwmId} amount={totalVaultShares} />
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
