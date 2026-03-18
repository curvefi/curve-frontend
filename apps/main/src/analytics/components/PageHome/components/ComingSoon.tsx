import { MIN_HEIGHT } from '@/analytics/features/charts/components/EChartsCard'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CrvHubIcon } from '@ui-kit/shared/icons/CrvHubIcon'
import { LAFIcon } from '@ui-kit/shared/icons/LAFIcon'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth, IconSize } = SizesAndSpaces

export const ComingSoon = () => (
  <Card>
    <CardHeader title={t`Coming soon`} size="small" />
    <CardContent size="small">
      <Stack gap={Spacing.sm} alignItems="center" justifyContent="center" minHeight={MIN_HEIGHT}>
        <Stack gap={Spacing.xs} alignItems="center">
          <LlamaIcon color="primary" sx={{ width: IconSize.xxl, height: IconSize.xxl }} />

          <Stack alignItems="center" textAlign="center" sx={{ maxWidth: MaxWidth.emptyStateCard, textWrap: 'pretty' }}>
            <Typography variant="headingXsBold">{t`Analytics v2 in progress`}</Typography>

            <Stack gap={Spacing.md}>
              <Typography variant="bodySRegular" color="textSecondary">
                {t`We are currently integrating deeper liquidity metrics, volume analysis, and historical yield projections.`}
              </Typography>

              <Typography variant="bodySRegular" color="textSecondary">
                {t`Come back soon to view more advanced metrics of the Curve ecosystem. In the meantime you can visit external monitoring platforms.`}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" gap={Spacing.xs} flexWrap="wrap" justifyContent="center">
          <ExternalLink
            wide
            variant="contained"
            color="primary"
            href="https://curvemonitor.com/"
            label={t`CurveMonitor`}
            startIcon={<LAFIcon color="warning" />}
            sx={{ width: `calc(${MaxWidth.emptyStateCard} / 2)` }}
          />

          <ExternalLink
            wide
            variant="contained"
            color="primary"
            href="https://crvhub.com/"
            label={t`CRVHub`}
            startIcon={<CrvHubIcon />}
            sx={{ width: `calc(${MaxWidth.emptyStateCard} / 2)` }}
          />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
)
