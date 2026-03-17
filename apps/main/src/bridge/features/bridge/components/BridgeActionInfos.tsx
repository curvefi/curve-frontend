import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type EstimatedTxCostProps } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

type BridgeActionInfosProps = EstimatedTxCostProps & {
  /** Query returning the estimated bridge cost in the chain's native token. */
  bridgeCost: QueryProp<number>
  nativeTokenSymbol: string
}

export const BridgeActionInfos = ({ bridgeCost, gas, isApproved, nativeTokenSymbol }: BridgeActionInfosProps) => {

  return (
    <Stack>
      <ActionInfo
        label={t`Estimated bridge cost`}
        value={
          bridgeCost.data == null
            ? undefined
            : formatNumber(bridgeCost.data, {
                unit: {
                  symbol: ` ${nativeTokenSymbol}`,
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
}
