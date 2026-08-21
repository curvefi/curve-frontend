import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatToken } from '@ui-kit/utils'
import type { BridgeProvider } from '../layerzero'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in the chain's native token. */
  bridgeCost: QueryProp<number>
  nativeTokenSymbol: string
  provider: BridgeProvider | undefined
  layerZeroCapacity?: QueryProp<string>
  layerZeroCapacityWarning?: ReactNode
}

const providerInfo = {
  fastbridge: {
    label: 'FastBridge',
    tooltip: t`FastBridge moves crvUSD from selected L2s to Ethereum without the canonical seven-day challenge period. Settlement may take 15 minutes or more.`,
  },
  layerzero: {
    label: 'LayerZero',
    tooltip: t`Curve LayerZero bridges move CRV, crvUSD, and scrvUSD between Ethereum and supported networks. Settlement may take several minutes.`,
  },
} as const

export const BridgeActionInfos = ({
  bridgeCost,
  gas,
  isApproved,
  nativeTokenSymbol,
  provider,
  layerZeroCapacity,
  layerZeroCapacityWarning,
}: BridgeActionInfosProps) => (
  <Stack>
    <ActionInfo
      label={t`Bridge`}
      labelTooltip={provider ? { title: providerInfo[provider].tooltip } : undefined}
      value={provider ? providerInfo[provider].label : '-'}
      size="small"
      testId="bridge-provider"
    />
    {provider === 'layerzero' && (
      <ActionInfo
        label={t`Available to bridge`}
        value={layerZeroCapacity ?? '-'}
        valueColor={layerZeroCapacityWarning ? 'error' : undefined}
        valueLeft={layerZeroCapacityWarning ? <ExclamationTriangleIcon color="error" fontSize="small" /> : undefined}
        valueTooltip={layerZeroCapacityWarning}
        size="small"
        testId="bridge-capacity"
      />
    )}
    <ActionInfo
      label={provider === 'layerzero' ? t`Destination cost` : t`Estimated bridge cost`}
      value={mapQuery(bridgeCost, data => formatToken(data, nativeTokenSymbol, 'amount'))}
      size="small"
    />

    <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
  </Stack>
)
