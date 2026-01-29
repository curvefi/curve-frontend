import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatUsd } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export type TxGasInfo = {
  estGasCostUsd?: number | Decimal | `${number}`
  tooltip?: string
}

export type EstimatedTxCostProps = {
  gas: Query<TxGasInfo | null>
  isApproved?: boolean
}

export const EstimatedTxCost = ({ gas, isApproved }: EstimatedTxCostProps) => (
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
  />
)

export const AccordionContent = ({ children }: { children: React.ReactNode }) => (
  <Stack gap={Spacing.sm}>{children}</Stack>
)
