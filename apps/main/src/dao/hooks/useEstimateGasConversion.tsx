import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { useChainId } from 'wagmi'
import networks from '@/dao/networks'
import { BN, formatNumber } from '@ui/utils'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { gweiToEther, weiToGwei } from '@ui-kit/utils'

const useEstimateGasConversion = (gas: number | null | undefined) => {
  const chainId = useChainId()
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })

  const gasPricesDefault = chainId && networks[chainId].gasPricesDefault
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })
  const basePlusPriorities = gasInfo?.basePlusPriority

  return useMemo(() => {
    const basePlusPriority =
      basePlusPriorities && typeof gasPricesDefault !== 'undefined' && basePlusPriorities[gasPricesDefault]

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
  }, [gas, chainId, chainTokenUsdRate, gasPricesDefault, basePlusPriorities])
}

export default useEstimateGasConversion
