import { t } from '@lingui/macro'
import { useMemo } from 'react'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'
import { NETWORK_TOKEN } from '@main/constants'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { Chain, gweiToEther, weiToGwei } from '@ui-kit/utils'
import useStore from '@main/store/useStore'
import DetailInfo from '@ui/DetailInfo'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { useCurve } from '@main/entities/curve'
import { ChainId, EstimatedGas } from '@main/types/main.types'

export type StepProgress = {
  active: number
  total: number
}

const DetailInfoEstGas = ({
  chainId,
  isDivider = false,
  loading,
  estimatedGas,
  stepProgress,
}: {
  chainId: ChainId
  isDivider?: boolean
  loading: boolean
  estimatedGas: EstimatedGas | null
  activeStep?: number
  stepProgress?: StepProgress | null
}) => {
  const { data: curve } = useCurve()
  const networks = useStore((state) => state.networks.networks)
  const { gasPricesDefault } = networks[chainId]
  const chainTokenUsdRate = useStore((state) => state.usdRates.usdRatesMapper[NETWORK_TOKEN])
  const gasInfo = useStore((state) => state.gas.gasInfo)
  const basePlusPriority = useStore((state) => state.gas.gasInfo?.basePlusPriority?.[gasPricesDefault])

  const { estGasCostUsd, tooltip } = useMemo(() => {
    let resp = { estGasCost: 0, estGasCostUsd: 0, tooltip: '' }
    if (estimatedGas && basePlusPriority) {
      const { symbol, gasPricesUnit } = networks[chainId]
      let gasCostInWei = 0

      if (
        (chainId === Chain.Arbitrum || chainId === Chain.XLayer || chainId === Chain.Mantle) &&
        gasInfo?.l2GasPriceWei &&
        typeof estimatedGas === 'number'
      ) {
        gasCostInWei = gasInfo.l2GasPriceWei * estimatedGas
      } else if (networks[chainId].gasL2 && Array.isArray(estimatedGas) && curve) {
        if (gasInfo?.l2GasPriceWei && gasInfo?.l1GasPriceWei) {
          const [l2GasUsedWei, l1GasUsedWei] = estimatedGas
          const l2GasCostWei = l2GasUsedWei * gasInfo.l2GasPriceWei
          const l1GasCostWei = l1GasUsedWei * gasInfo.l1GasPriceWei
          gasCostInWei = l2GasCostWei + l1GasCostWei
        }
      } else if (typeof estimatedGas === 'number') {
        gasCostInWei = basePlusPriority * estimatedGas
      }
      const gasCostInGwei = weiToGwei(gasCostInWei)
      const gasCostInEther = gweiToEther(gasCostInGwei)
      const tooltipGasCostInEther = formatNumber(gasCostInEther)
      const tooltipBasePlusPriority = formatNumber(weiToGwei(basePlusPriority), { maximumFractionDigits: 2 })

      resp.estGasCost = gasCostInWei
      resp.estGasCostUsd = isUndefined(chainTokenUsdRate) ? 0 : +gasCostInEther * chainTokenUsdRate
      resp.tooltip = `${tooltipGasCostInEther} ${symbol} at ${tooltipBasePlusPriority} ${gasPricesUnit}`
    }
    return resp
  }, [
    estimatedGas,
    basePlusPriority,
    chainId,
    curve,
    chainTokenUsdRate,
    gasInfo?.l2GasPriceWei,
    gasInfo?.l1GasPriceWei,
    networks,
  ])

  const labelText = t`Estimated TX cost:`
  const Label = stepProgress ? (
    <>
      <span>{labelText}</span>{' '}
      <StepProgressWrapper>({t`Step ${stepProgress.active} of ${stepProgress.total}`}):</StepProgressWrapper>
    </>
  ) : (
    labelText
  )

  const Tooltip = tooltip && (
    <IconTooltip placement="top end" noWrap>
      {tooltip}
    </IconTooltip>
  )

  const haveUsdRate = !isUndefined(chainTokenUsdRate) && !isNaN(chainTokenUsdRate)

  return (
    <DetailInfo isDivider={isDivider} loading={loading} loadingSkeleton={[50, 20]} label={Label} tooltip={Tooltip}>
      {estGasCostUsd &&
        (haveUsdRate ? <span>{formatNumber(estGasCostUsd, FORMAT_OPTIONS.USD)}</span> : t`Unable to get USD rate`)}
    </DetailInfo>
  )
}

const StepProgressWrapper = styled.span`
  font-size: var(--font-size-0);
  text-transform: uppercase;
`

export default DetailInfoEstGas
