import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
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
      <Typography variant="bodyXsRegular" color="textSecondary">
        {t`Fastbridge lets you use Curve’s decentralised infrastructure to bridge back crvUSD from selected L2s to Ethereum mainnet bypassing the 7 days challenge period.`}
        <br />
        <br />
        {t`Use native bridges or bridge aggregators to move funds to and from other networks.`}
        <br />
        <br />
        {t`Bridges are not instant, and funds may take up to 15 minutes or more before arriving.`}
      </Typography>

      <Stack direction="row" justifyContent="space-between">
        <Button
          variant="link"
          color="ghost"
          href="https://curvefi.github.io/fast-bridge/"
          target="_blank"
          rel="noreferrer"
          sx={{ alignSelf: 'end' }}
          endIcon={<ArrowOutwardIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
        >
          {t`FastBridge Monitor`}
        </Button>

        <Button
          variant="link"
          color="ghost"
          href="https://docs.curve.finance/fast-bridge/overview/"
          target="_blank"
          rel="noreferrer"
          sx={{ alignSelf: 'end' }}
          endIcon={<ArrowOutwardIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
        >
          {t`Learn More`}
        </Button>
      </Stack>
    </Stack>
  </Alert>
)
