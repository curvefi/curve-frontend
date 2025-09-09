import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ethAddress } from 'viem'
import networks from '@/loan/networks'
import { ChainId } from '@/loan/types/loan.types'
import DetailInfo from '@ui/DetailInfo'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { calculateGasEstimation, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

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

const DetailInfoEstimateGas = ({ chainId, isDivider = false, loading, estimatedGas, stepProgress }: Props) => {
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const network = networks[chainId]
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  const { estGasCostUsd, tooltip } = useMemo(() => {
    if (!chainId || !estimatedGas) return { estGasCostUsd: 0, tooltip: '' }
    const { symbol, gasPricesUnit, gasL2, gasPricesDefault } = network
    return calculateGasEstimation(
      estimatedGas,
      gasInfo,
      gasPricesDefault,
      chainTokenUsdRate,
      symbol,
      gasPricesUnit,
      gasL2,
      chainId,
    )
  }, [chainId, estimatedGas, network, gasInfo, chainTokenUsdRate])

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
          <IconTooltip placement="top-end" noWrap>
            {tooltip}
          </IconTooltip>
        ) : null
      }
    >
      {estGasCostUsd ? (
        estGasCostUsd === 'NaN' ? (
          t`Unable to get USD rate`
        ) : (
          <span>{formatNumber(estGasCostUsd, FORMAT_OPTIONS.USD)}</span>
        )
      ) : (
        ''
      )}
    </DetailInfo>
  )
}

const StepProgressWrapper = styled.span`
  font-size: var(--font-size-0);
  text-transform: uppercase;
`

export default DetailInfoEstimateGas
