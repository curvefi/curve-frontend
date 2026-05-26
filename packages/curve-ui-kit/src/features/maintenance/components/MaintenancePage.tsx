import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { CURVE_LOGO_URL, CURVE_SOCIALS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { XIcon } from '@ui-kit/shared/icons/XIcon'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight, Spacing, MaxWidth } = SizesAndSpaces

const Image = styled('img')({})

export const MaintenancePage = () => (
  <Stack
    component="main"
    sx={{
      backgroundColor: theme => theme.design.Layer.App.Background,
      padding: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: MinHeight.maintenancePage,
    }}
    data-testid="maintenance-page"
  >
    <Stack sx={{ gap: Spacing.xxl, aligItems: 'center', maxWidth: MaxWidth.maintenanceContent }}>
      <Stack component="header" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
        <Typography component="h1" variant="headingSBold">
          {t`Curve.finance`}
        </Typography>
        <Typography variant="bodySRegular" color="textTertiary">
          {t`swap · earn · deploy`}
        </Typography>
      </Stack>

      <Image
        alt={t`Curve Logo`}
        src={CURVE_LOGO_URL}
        width="50%" //image to big vertically on 14" screens
      />

      <Stack sx={{ gap: Spacing.sm.desktop /** gap is fixed at 10px on Figma */, alignItems: 'center' }}>
        <Badge label={t`Upgrade in progress`} color="highlight" size="extraLarge" />

        <Typography>
          {t`Curve is currently undergoing scheduled maintenance. We're upgrading our infrastructure to make your experience faster.`}
        </Typography>

        <Typography variant="bodySRegular" color="textSecondary">
          {t`Contracts are running as expected, immutable and always available onchain.`}
          <br />
          {t`We'll be back online shortly.`}
        </Typography>

        <Button href={CURVE_SOCIALS.twitter} target="_blank" rel="noreferrer" variant="contained" startIcon={<XIcon />}>
          {t`Get updates`}
        </Button>
      </Stack>
    </Stack>
  </Stack>
)
