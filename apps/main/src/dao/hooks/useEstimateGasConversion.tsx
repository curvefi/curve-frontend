import { useMemo } from 'react'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import type { CurveApi } from '@/dao/types/dao.types'
import { BN, formatNumber } from '@ui/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { gweiToEther, weiToGwei } from '@ui-kit/utils'

const useEstimateGasConversion = (gas: number | null | undefined) => {
  const curve = requireLib<CurveApi>()
  const chainId = curve?.chainId
  const chainTokenUsdRate = useStore().usdRates.usdRatesMapper['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']
  const gasPricesDefault = chainId && networks[chainId].gasPricesDefault
  const basePlusPriorities = useStore().gas.gasInfo?.basePlusPriority

  return useMemo(() => {
    const basePlusPriority =
      basePlusPriorities && typeof gasPricesDefault !== 'undefined' && basePlusPriorities[gasPricesDefault]

    if (!curve || !chainId) return { estGasCost: undefined, estGasCostUsd: undefined, tooltip: undefined }

    if (!basePlusPriority || !gas) return { estGasCost: undefined, estGasCostUsd: undefined, tooltip: undefined }

    const { symbol, gasPricesUnit } = networks[chainId]
    const estGasCost = new BN(gweiToEther(weiToGwei(basePlusPriority) * gas))
    if (chainTokenUsdRate === undefined) {
      return { estGasCost: estGasCost.toString(), estGasCostUsd: undefined, tooltip: undefined }
    } else {
      const estGasCostUsd = estGasCost.multipliedBy(chainTokenUsdRate).toString()
      const gasAmountUnit = formatNumber(weiToGwei(basePlusPriority), { maximumFractionDigits: 2 })
      const tooltip = `${formatNumber(estGasCost.toString())} ${symbol} at ${gasAmountUnit} ${gasPricesUnit}`
      return { estGasCost: estGasCost.toString(), estGasCostUsd, tooltip }
    }
  }, [gas, curve, chainId, chainTokenUsdRate, gasPricesDefault, basePlusPriorities])
}

export default useEstimateGasConversion
