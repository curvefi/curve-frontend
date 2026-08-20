import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatToken } from '@ui-kit/utils'
import type { BridgeProvider } from '../layerzero'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in the chain's native token. */
  bridgeCost: QueryProp<number>
  nativeTokenSymbol: string
  provider: BridgeProvider | undefined
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
}: BridgeActionInfosProps) => (
  <Stack>
    <ActionInfo
      label={t`Bridge`}
      labelTooltip={provider ? { title: providerInfo[provider].tooltip } : undefined}
      value={provider ? providerInfo[provider].label : '-'}
      size="small"
      testId="bridge-provider"
    />
    <ActionInfo
      label={t`Estimated bridge cost`}
      value={mapQuery(bridgeCost, data => formatToken(data, nativeTokenSymbol, 'amount'))}
      size="small"
    />

    <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
  </Stack>
)
