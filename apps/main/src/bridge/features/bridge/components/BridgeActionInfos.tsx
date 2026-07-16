import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatToken } from '@ui-kit/utils'

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
