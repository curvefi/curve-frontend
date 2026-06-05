import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ethAddress } from 'viem'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { DetailInfo } from '@ui/DetailInfo'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { t } from '@ui-kit/lib/i18n'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { formatNumber } from '@ui-kit/utils'

type StepProgress = {
  active: number
  total: number
}

type Props = {
  chainId: ChainId
  isDivider?: boolean
  loading?: boolean
  estimatedGas: number | null
  activeStep?: number
  stepProgress?: StepProgress | null
}

export const DetailInfoEstimateGas = ({ chainId, isDivider = false, loading, estimatedGas, stepProgress }: Props) => {
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const network = networks[chainId]
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  const { estGasCost, estGasCostUsd, tooltip } = useMemo(
    () => calculateGas(estimatedGas, gasInfo, chainTokenUsdRate, network),
    [estimatedGas, network, gasInfo, chainTokenUsdRate],
  )

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
      {estGasCost ? (
        estGasCostUsd == null ? (
          t`Unable to get USD rate`
        ) : (
          <strong>{formatNumber(estGasCostUsd, 'usd.amount')}</strong>
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
