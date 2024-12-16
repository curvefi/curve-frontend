import { useEffect, useMemo } from 'react'
import useStore from '@/store/useStore'

import { FORMAT_OPTIONS, formatNumber, formatNumberWithPrecision } from '@/ui/utils'
import { useTokenUsdRate } from '@/entities/token'
import { useOneWayMarket } from '@/entities/chain'

function useVaultShares(rChainId: ChainId, rOwmId: string, vaultShares: string | number | undefined = '0') {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const pricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])
  const { address = '', symbol = '' } = market?.borrowed_token ?? {}
  const { data: usdRate } = useTokenUsdRate({ chainId: rChainId, tokenAddress: address })
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const { borrowedAmount, borrowedAmountUsd } = useMemo<{ borrowedAmount: string; borrowedAmountUsd: string }>(() => {
    const { pricePerShare, error } = pricePerShareResp ?? {}

    if (error || usdRate == null || isNaN(usdRate)) {
      return { borrowedAmount: '?', borrowedAmountUsd: '?' }
    }

    if (symbol && +pricePerShare > 0 && +vaultShares > 0) {
      const borrowedAmt = +pricePerShare * +vaultShares
      const borrowedAmtUsd = +pricePerShare * +vaultShares * +usdRate

      return {
        borrowedAmount: `${formatNumberWithPrecision(borrowedAmt, 6)} ${symbol}`,
        borrowedAmountUsd: formatNumber(borrowedAmtUsd, FORMAT_OPTIONS.USD),
      }
    }

    return { borrowedAmount: '', borrowedAmountUsd: '' }
  }, [pricePerShareResp, usdRate, symbol, vaultShares])

  useEffect(() => {
    if (market && +vaultShares > 0) fetchVaultPricePerShare(rChainId, market)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market?.id, vaultShares])

  return {
    isLoading: borrowedAmount === '' && borrowedAmountUsd === '',
    isError: borrowedAmount === '?' && borrowedAmountUsd === '?',
    borrowedAmount,
    borrowedAmountUsd,
  }
}

export default useVaultShares
