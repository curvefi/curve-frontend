import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { RepayTokenList } from '@/llamalend/features/manage-loan/components/RepayTokenList'
import { RepayTokenOption } from '@/llamalend/features/manage-loan/hooks/useRepayTokens'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { TokenSelector } from '@ui-kit/features/select-token'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { Decimal } from '@ui-kit/utils'

export function RepayTokenSelector<ChainId extends IChainId>({
  market,
  network,
  selected,
  onSelect,
  options,
  positionCollateral,
}: {
  market: LlamaMarketTemplate | undefined
  network: NetworkDict<ChainId>[ChainId]
  selected: RepayTokenOption | undefined
  onSelect: (token: RepayTokenOption) => void
  options: RepayTokenOption[]
  positionCollateral: Decimal | undefined
}) {
  const { address: userAddress } = useConnection()
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const tokenAddresses = useMemo(
    () => notFalsy(collateralToken?.address, borrowToken?.address),
    [collateralToken?.address, borrowToken?.address],
  )
  const { data: tokenBalances } = useTokenBalances({ chainId: network.chainId, userAddress, tokenAddresses })
  const { data: tokenPrices } = useTokenUsdRates({ chainId: network.chainId, tokenAddresses })

  return (
    <TokenSelector selectedToken={selected} title={t`Select Repay Token`}>
      <RepayTokenList
        tokens={options}
        balances={tokenBalances}
        tokenPrices={tokenPrices}
        positionCollateral={positionCollateral}
        onToken={onSelect}
      />
    </TokenSelector>
  )
}
