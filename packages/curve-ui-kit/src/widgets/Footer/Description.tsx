import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { RCLogoSM } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize, Spacing, FontWeight } = SizesAndSpaces

export const Description = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <RouterLink
      href="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        gap: Spacing.xs,
      }}
    >
      <SvgIcon
        sx={{
          width: IconSize.xxl,
          height: IconSize.xxl,
          margin: Spacing.sm,
        }}
      >
        <RCLogoSM />
      </SvgIcon>

      <Typography
        color="textPrimary"
        sx={{
          '&': {
            // One-off for the logo text (fixed size). Extra '&' specificity needed to override default.
            fontSize: Sizing[600],
          },
          fontWeight: FontWeight.Bold,
        }}
      >
        Curve
      </Typography>
    </RouterLink>

    <Typography
      variant="bodySRegular"
      color="textSecondary"
      sx={{
        textWrap: 'balance',
      }}
    >
      {t`Curve DAO is building the software that powers the future world economy: decentralised, trustless, inclusive and autonomous.`}
    </Typography>
  </Box>
)
