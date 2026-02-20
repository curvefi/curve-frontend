import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import type { QueryProp } from '@ui-kit/types/util'
import { Amount, formatUsd } from '@ui-kit/utils'
import { ActionInfo } from './ActionInfo'

export type TxGasInfo = {
  estGasCostUsd?: Amount
  tooltip?: string
}

export type EstimatedTxCostProps = {
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
}

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
    valueLeft={<FireIcon fontSize="small" />}
    error={gas.error}
  />
)
