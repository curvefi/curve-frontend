import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { formatUsd } from '@ui-kit/utils'
import { ActionInfo } from './ActionInfo'

export type TxGasInfo = {
  estGasCostUsd?: Amount
  tooltip?: string
}

export type EstimatedTxCostProps = {
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
}

const { IconSize } = SizesAndSpaces

export const ActionInfoGasEstimate = ({ gas, isApproved }: EstimatedTxCostProps) => (
  <ActionInfo
    label={
      <>
        {t`Estimated tx cost`}
        <Typography color="textTertiary" component="span" variant="bodyXsRegular">
          {isApproved === true && ` ${t`step 2/2`}`}
          {isApproved === false && ` ${t`step 1/2`}`}
        </Typography>
      </>
    }
    value={gas.data?.estGasCostUsd == null ? undefined : formatUsd(gas.data.estGasCostUsd)}
    valueTooltip={gas.data?.tooltip}
    loading={gas.isLoading}
    valueLeft={<FireIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
    size="small"
    error={gas.error}
    testId="estimated-tx-cost"
  />
)
