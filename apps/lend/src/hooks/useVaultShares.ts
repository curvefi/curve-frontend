import { useEffect, useMemo } from 'react'
import useStore from '@/store/useStore'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

function useVaultShares(rChainId: ChainId, rOwmId: string, vaultShares: string | number | undefined = '0') {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const pricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])
  const { address = '', symbol = '' } = owmData?.owm?.borrowed_token ?? {}
  const usdRate = useStore((state) => state.usdRates.tokens[address])
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const { borrowedAmount, borrowedAmountUsd } = useMemo<{ borrowedAmount: string; borrowedAmountUsd: string }>(() => {
    const { pricePerShare, error } = pricePerShareResp ?? {}

    if (error || usdRate === 'NaN') {
      return { borrowedAmount: '?', borrowedAmountUsd: '?' }
    }

    if (symbol && +pricePerShare > 0 && +vaultShares > 0) {
      const borrowedAmt = +pricePerShare * +vaultShares
      const borrowedAmtUsd = +pricePerShare * +vaultShares * +usdRate

      return {
        borrowedAmount: `${formatNumber(borrowedAmt, { showDecimalIfSmallNumberOnly: true })}${' '}${symbol}`,
        borrowedAmountUsd: formatNumber(borrowedAmtUsd, FORMAT_OPTIONS.USD),
      }
    }

    return { borrowedAmount: '', borrowedAmountUsd: '' }
  }, [pricePerShareResp, usdRate, symbol, vaultShares])

  useEffect(() => {
    if (owmData && +vaultShares > 0) fetchVaultPricePerShare(rChainId, owmData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owmData?.owm?.id, vaultShares])

  return {
    isLoading: borrowedAmount === '' && borrowedAmountUsd === '',
    isError: borrowedAmount === '?' && borrowedAmountUsd === '?',
    borrowedAmount,
    borrowedAmountUsd,
  }
}

export default useVaultShares
