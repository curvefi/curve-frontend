import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ethAddress } from 'viem'
import networks from '@/dao/networks'
import { ChainId, EstimatedGas } from '@/dao/types/dao.types'
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
  stepProgress?: StepProgress | null
}) => {
  const network = networks[chainId]
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  const { estGasCostUsd, tooltip } = useMemo(() => {
    if (!estimatedGas || !chainId) return { estGasCostUsd: 0, tooltip: '' }
    const { estGasCostUsd, tooltip } = calculateGasEstimation(estimatedGas, gasInfo, chainTokenUsdRate, network)
    return { estGasCostUsd: lodash.isUndefined(chainTokenUsdRate) ? 0 : estGasCostUsd || 0, tooltip: tooltip || '' }
  }, [estimatedGas, chainId, chainTokenUsdRate, network, gasInfo])

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
