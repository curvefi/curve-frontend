import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import type { CollateralValue } from '@ui-kit/shared/ui/PositionDetails'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { CollateralMetricTooltip } from './CollateralMetricTooltip'

type CollateralMetricProps = {
  collateralValue: CollateralValue | undefined | null
}

export const CollateralMetric = ({ collateralValue }: CollateralMetricProps) => (
  <Tooltip
    clickable
    title={t`Collateral Value`}
    body={<CollateralMetricTooltip collateralValue={collateralValue} />}
    placement="top"
  >
    <Metric
      size="small"
      label={t`Collateral Value`}
      value={collateralValue?.totalValue}
      loading={collateralValue?.totalValue == null && collateralValue?.loading}
      valueOptions={{ unit: 'dollar' }}
      hideTooltip
    />
  </Tooltip>
)
