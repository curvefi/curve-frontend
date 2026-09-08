import type { ReactNode } from 'react'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { FireIcon } from '@ui/icons/FireIcon'
import { t } from '@ui/lib/i18n'
import { ActionInfo } from './ActionInfo'

export type TxGasInfo = {
  estGasCostUsd?: Amount
  tooltip?: string
}

export type EstimatedTxCostProps = {
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
  label?: ReactNode
  testId?: string
}

const { IconSize } = SizesAndSpaces

export const ActionInfoGasEstimate = ({
  gas,
  isApproved,
  label = t`Estimated tx cost`,
  testId = 'estimated-tx-cost',
}: EstimatedTxCostProps) => (
  <ActionInfo
    label={
      <>
        {label}
        <Typography color="textTertiary" component="span" variant="bodyXsRegular">
          {isApproved === true && ` ${t`step 2/2`}`}
          {isApproved === false && ` ${t`step 1/2`}`}
        </Typography>
      </>
    }
    value={mapQuery(gas, data => maybe(data?.estGasCostUsd, value => formatNumber(value, 'usd.notional')))}
    valueTooltip={gas.data?.tooltip}
    valueLeft={<FireIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />}
    size="small"
    testId={testId}
  />
)
