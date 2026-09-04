import { MIN_HEIGHT } from '@/analytics/features/charts/components/EChartsCard'
import { EmptyStateCard } from '@evm-ui/shared/ui/EmptyStateCard'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CrvHubIcon } from '@ui/icons/CrvHubIcon'
import { LAFIcon } from '@ui/icons/LAFIcon'
import { t, Trans } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

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
