import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ethAddress } from 'viem'
import networks from '@/dao/networks'
import { CurveApi, ChainId, EstimatedGas } from '@/dao/types/dao.types'
import DetailInfo from '@ui/DetailInfo'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { gweiToEther, weiToGwei } from '@ui-kit/utils'

export type StepProgress = {
  active: number
  total: number
}

const DetailInfoEstGas = ({
  curve,
  chainId,
  isDivider = false,
  loading,
  estimatedGas,
  stepProgress,
}: {
  curve: CurveApi | null
  chainId: ChainId
  isDivider?: boolean
  loading: boolean
  estimatedGas: EstimatedGas | null
  activeStep?: number
  stepProgress?: StepProgress | null
}) => {
  const { gasPricesDefault } = networks[chainId]
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })
  const basePlusPriority = gasInfo?.basePlusPriority?.[gasPricesDefault]

  const { estGasCostUsd, tooltip } = useMemo(() => {
    const resp = { estGasCost: 0, estGasCostUsd: 0, tooltip: '' }
    if (estimatedGas && basePlusPriority) {
      const { symbol, gasPricesUnit } = networks[chainId]
      let gasCostInWei = 0

      if (networks[chainId].gasL2 && Array.isArray(estimatedGas) && curve) {
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
      resp.estGasCostUsd = lodash.isUndefined(chainTokenUsdRate) ? 0 : +gasCostInEther * chainTokenUsdRate
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
    <IconTooltip placement="top-end" noWrap>
      {tooltip}
    </IconTooltip>
  )

  const haveUsdRate = !lodash.isUndefined(chainTokenUsdRate) && !lodash.isNaN(chainTokenUsdRate)

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
