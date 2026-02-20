import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in ETH. */
  bridgeCost: Query<number>
}

export const BridgeActionInfos = ({ bridgeCost, gas, isApproved }: BridgeActionInfosProps) => (
  <Stack>
    <ActionInfo
      label={t`Estimated bridge cost`}
      value={
        bridgeCost.data == null
          ? undefined
          : formatNumber(bridgeCost.data, {
              unit: {
                symbol: ' ETH',
                position: 'suffix',
              },
              abbreviate: false,
            })
      }
      size="small"
      loading={bridgeCost.isLoading}
      error={bridgeCost.error}
    />

    <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
  </Stack>
)
