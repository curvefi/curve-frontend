import { t } from '@lingui/macro'

import { useMemo } from 'react'
import styled from 'styled-components'

import { BN, FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { gweiToEther, weiToGwei } from '@/shared/curve-lib'
import networks from '@/networks'
import useStore from '@/store/useStore'

import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { useTokenUsdRate } from '@/entities/token'
import { NETWORK_TOKEN } from '@/constants'

export type StepProgress = {
  active: number
  total: number
}

interface Props {
  chainId: ChainId
  isDivider?: boolean
  loading?: boolean
  estimatedGas: number | null
  activeStep?: number
  stepProgress?: StepProgress | null
}

const DetailInfoEstimateGas = ({ chainId, isDivider, loading, estimatedGas, stepProgress }: Props) => {
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: NETWORK_TOKEN })
  const gasPricesDefault = chainId && networks[chainId].gasPricesDefault
  // TODO: allow gas prices priority adjustment
  const basePlusPriorities = useStore((state) => state.gas.gasInfo?.basePlusPriority)
  const basePlusPriority =
    basePlusPriorities && typeof gasPricesDefault !== 'undefined' && basePlusPriorities[gasPricesDefault]

  const { estGasCostUsd, tooltip } = useMemo(() => {
    if (estimatedGas && chainId && chainTokenUsdRate && basePlusPriority) {
      const { symbol, gasPricesUnit } = networks[chainId]

      const estGasCost = new BN(gweiToEther(weiToGwei(basePlusPriority) * estimatedGas))
      if (isNaN(chainTokenUsdRate)) {
        return { estGasCost: estGasCost.toString(), estGasCostUsd: 'NaN', tooltip: '' }
      } else {
        const estGasCostUsd = estGasCost.multipliedBy(new BN(chainTokenUsdRate)).toString()
        const gasAmountUnit = formatNumber(weiToGwei(basePlusPriority), { maximumFractionDigits: 2 })
        const tooltip = `${formatNumber(estGasCost.toString())} ${symbol} at ${gasAmountUnit} ${gasPricesUnit}`
        return { estGasCost: estGasCost.toString(), estGasCostUsd, tooltip }
      }
    }
    return { estGasCost: 0, estGasCostUsd: 0, tooltip: '' }
  }, [chainTokenUsdRate, basePlusPriority, chainId, estimatedGas])

  return (
    <DetailInfo
      isDivider={isDivider}
      loading={loading}
      loadingSkeleton={[50, 20]}
      label={
        stepProgress ? (
          <>
            <span>{t`Estimated TX cost`}</span>{' '}
            <StepProgressWrapper>({t`Step ${stepProgress.active} of ${stepProgress.total}`}):</StepProgressWrapper>
          </>
        ) : (
          t`Estimated TX cost:`
        )
      }
      tooltip={
        tooltip ? (
          <IconTooltip placement="top end" noWrap>
            {tooltip}
          </IconTooltip>
        ) : null
      }
    >
      {estGasCostUsd ? (
        estGasCostUsd === 'NaN' ? (
          t`Unable to get USD rate`
        ) : (
          <strong>{formatNumber(estGasCostUsd, FORMAT_OPTIONS.USD)}</strong>
        )
      ) : (
        ''
      )}
    </DetailInfo>
  )
}

DetailInfoEstimateGas.defaultProps = {
  isDivider: false,
}

const StepProgressWrapper = styled.span`
  font-size: var(--font-size-0);
  text-transform: uppercase;
`

export default DetailInfoEstimateGas
