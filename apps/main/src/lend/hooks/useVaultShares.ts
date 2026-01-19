import { useMemo } from 'react'
import { useOneWayMarket } from '@/lend/entities/chain'
import { ChainId } from '@/lend/types/lend.types'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { formatNumber } from '@ui-kit/utils'
import { useMarketPricePerShare } from '../entities/market-details'

function formatNumberWithPrecision(value: number, precisionDigits: number) {
  const valueDigits = Math.max(0, Math.floor(Math.log10(value)))
  const decimals = precisionDigits - Math.min(precisionDigits, valueDigits)
  return formatNumber(value, { abbreviate: false, decimals })
}

export function useVaultShares(rChainId: ChainId, rOwmId: string, vaultShares: string | number | undefined = '0') {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const { data: pricePerShare, error: errorPricePerShare } = useMarketPricePerShare({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const { address = '', symbol = '' } = market?.borrowed_token ?? {}
  const { data: usdRate } = useTokenUsdRate({ chainId: rChainId, tokenAddress: address })

  const { borrowedAmount, borrowedAmountUsd } = useMemo<{ borrowedAmount: string; borrowedAmountUsd: string }>(() => {
    if (pricePerShare == null || errorPricePerShare || usdRate == null || isNaN(usdRate)) {
      return { borrowedAmount: '?', borrowedAmountUsd: '?' }
    }

    if (symbol && +pricePerShare > 0 && +vaultShares > 0) {
      const borrowedAmt = +pricePerShare * +vaultShares
      const borrowedAmtUsd = +pricePerShare * +vaultShares * +usdRate

      return {
        borrowedAmount: `${formatNumberWithPrecision(borrowedAmt, 6)} ${symbol}`,
        borrowedAmountUsd: formatNumber(borrowedAmtUsd, { unit: 'dollar', abbreviate: false }),
      }
    }

    return { borrowedAmount: '', borrowedAmountUsd: '' }
  }, [pricePerShare, errorPricePerShare, usdRate, symbol, vaultShares])

  return {
    isLoading: borrowedAmount === '' && borrowedAmountUsd === '',
    isError: borrowedAmount === '?' && borrowedAmountUsd === '?',
    borrowedAmount,
    borrowedAmountUsd,
  }
}
