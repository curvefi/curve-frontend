import { MIN_HEIGHT } from '@/analytics/features/charts/components/EChartsCard'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { EXTERNAL_LINKS } from '@ui/utils'
import { t, Trans } from '@ui-kit/lib/i18n'
import { CrvHubIcon } from '@ui-kit/shared/icons/CrvHubIcon'
import { LAFIcon } from '@ui-kit/shared/icons/LAFIcon'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ComingSoon = () => (
  <Card component={Stack} size="small" sx={{ height: '100%' }}>
    <CardHeader title={t`Coming soon`} />
    <CardContent
      component={Stack}
      sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: MIN_HEIGHT, gap: Spacing.sm }}
    >
      <EmptyStateCard
        title={t`Analytics v2 in progress`}
        description={
          <Trans>
            We are currently integrating deeper liquidity metrics, volume analysis, and historical yield projections.{' '}
            <br /> <br />
            Come back soon to view more advanced metrics of the Curve ecosystem. In the meantime you can visit external
            monitoring platforms.
          </Trans>
        }
        button={{
          label: t`CurveMonitor`,
          href: EXTERNAL_LINKS.monitoring.curveMonitor,
          startIcon: <LAFIcon color="warning" />,
        }}
        secondaryButton={{
          label: t`CRVHub`,
          href: EXTERNAL_LINKS.monitoring.crvHub,
          startIcon: <CrvHubIcon />,
        }}
      />
    </CardContent>
  </Card>
)
