import ListInfoItem from '@/ui/ListInfo'
import Chip from '@/ui/Typography/Chip'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import InpChipUsdRate from '@/components/InpChipUsdRate'
import useVaultShares from '@/hooks/useVaultShares'
import useStore from '@/store/useStore'


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
