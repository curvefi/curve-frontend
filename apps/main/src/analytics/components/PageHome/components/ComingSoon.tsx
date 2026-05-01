import { MIN_HEIGHT } from '@/analytics/features/charts/components/EChartsCard'
import Box from '@mui/material/Box'
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
  <Card component={Stack} size="small" height="100%">
    <CardHeader title={t`Coming soon`} />
    <CardContent component={Stack} flexGrow={1}>
      <Stack
        flexGrow={1}
        gap={Spacing.sm}
        alignItems="center"
        justifyContent="center"
        minHeight={MIN_HEIGHT}
        marginInline="auto"
        sx={{ maxWidth: MaxWidth.emptyStateCard }}
      >
        <Stack gap={Spacing.xs} alignItems="center">
          <LlamaIcon color="primary" sx={{ width: IconSize.xxl, height: IconSize.xxl }} />

          <Stack alignItems="center" textAlign="center" sx={{ textWrap: 'pretty' }}>
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

        {/** Using grid here for equal sized buttons */}
        <Box display="grid" gap={Spacing.xs} gridTemplateColumns={{ tablet: '1fr 1fr' }}>
          <ExternalLink
            wide
            variant="contained"
            color="primary"
            href="https://curvemonitor.com/"
            label={t`CurveMonitor`}
            startIcon={<LAFIcon color="warning" />}
          />

          <ExternalLink
            wide
            variant="contained"
            color="primary"
            href="https://crvhub.com/"
            label={t`CRVHub`}
            startIcon={<CrvHubIcon />}
          />
        </Box>
      </Stack>
    </CardContent>
  </Card>
)
