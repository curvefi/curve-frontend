import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Informational alert displayed on the FastBridge page.
 * Explains how the bridge bypasses the 7-day challenge period
 * and links to the Curve documentation for more details.
 */
export const BridgeInfoAlert = () => (
  <Alert variant="outlined" severity="info">
    <AlertTitle>{t`crvUSD to mainnet in minutes`}</AlertTitle>
    <Stack gap={Spacing.xs}>
      <Typography component="p" variant="bodyXsRegular">
        {t`Fastbridge lets you use Curve’s decentralised infrastructure to bridge back crvUSD from selected L2s to Ethereum mainnet bypassing the 7 days challenge period.`}
      </Typography>

      <Typography component="p" variant="bodyXsRegular">
        {t`Use native bridges or bridge aggregators to move funds to and from other networks.`}
      </Typography>

      <Typography component="p" variant="bodyXsRegular">
        {t`Bridges are not instant, and funds may take up to 15 minutes or more before arriving.`}
      </Typography>

      <Stack direction="row" justifyContent="space-between">
        <ExternalLink href="https://curvefi.github.io/fast-bridge/" label={t`FastBridge Monitor`} />
        <ExternalLink href="https://docs.curve.finance/fast-bridge/overview/" label={t`Learn More`} />
      </Stack>
    </Stack>
  </Alert>
)
