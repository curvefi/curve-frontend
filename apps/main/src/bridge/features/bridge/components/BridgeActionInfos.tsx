import { formatToken } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in the chain's native token. */
  bridgeCost: QueryProp<number>
  nativeTokenSymbol: string | undefined
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
