import Stack from '@mui/material/Stack'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@evm-ui/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatToken } from '@evm-ui/utils'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in the chain's native token. */
  bridgeCost: QueryProp<number>
  nativeTokenSymbol: string
}

export const BridgeActionInfos = ({ bridgeCost, gas, isApproved, nativeTokenSymbol }: BridgeActionInfosProps) => (
  <Stack>
    <ActionInfo
      label={t`Estimated bridge cost`}
      value={mapQuery(bridgeCost, data => formatToken(data, nativeTokenSymbol, 'amount'))}
      size="small"
    />

    <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
  </Stack>
)
