import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { UserPositionSummaryMetric, useUserPositionsSummary } from './hooks/useUserPositionsSummary'

const { Spacing, IconSize } = SizesAndSpaces

type UserPositionStatisticsProps = {
  markets: LlamaMarket[] | undefined
}

export const UserPositionSummary = ({ markets }: UserPositionStatisticsProps) => {
  const summary = useUserPositionsSummary({ markets })
  return (
    <Grid container spacing={Spacing.sm} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {summary.map((item) => (
        <UserPositionStatisticItem key={item.label} {...item} />
      ))}
    </Grid>
  )
}

const UserPositionStatisticItem = ({ label, data, isLoading, isError }: UserPositionSummaryMetric) => (
  <Grid size={3} padding={Spacing.md}>
    <Metric
      value={data}
      size="large"
      valueOptions={{
        decimals: 2,
        unit: 'dollar',
        color: 'textPrimary',
      }}
      label={label}
      rightAdornment={
        <>
          {isError && (
            <Tooltip
              arrow
              placement="top"
              title={t`Error fetching ${label}`}
              body={<TooltipDescription text={t`Some positions may be missing.`} />}
            >
              <ExclamationTriangleIcon fontSize="small" color="error" />
            </Tooltip>
          )}
          {isLoading && !isError && <CircularProgress size={IconSize.xs.desktop} />}
        </>
      }
    />
  </Grid>
)
