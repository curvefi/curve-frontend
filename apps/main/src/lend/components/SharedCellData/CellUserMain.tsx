import styled from 'styled-components'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import useVaultShares from '@/lend/hooks/useVaultShares'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import ListInfoItem from '@ui/ListInfo'
import Chip from '@ui/Typography/Chip'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

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
  market: LendMarketTemplate
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
