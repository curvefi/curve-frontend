import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RouterLink } from '@ui/components/RouterLink'
import { Sizing } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { CURVE_LOGO_URL } from '@ui/lib/resource.constants'

const { IconSize, Spacing } = SizesAndSpaces

const Image = styled('img')({})

export const Description = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: Spacing.xs }}>
      <Image
        alt={t`Curve Logo`}
        src={CURVE_LOGO_URL}
        sx={{ width: IconSize.xxl, height: IconSize.xxl, margin: Spacing.sm }}
      />

      <Typography
        color="textPrimary"
        sx={{
          '&': {
            // One-off for the logo text (fixed size). Extra '&' specificity needed to override default.
            fontSize: Sizing[600],
          },
          fontWeight: t => t.design.Text.FontWeight.Bold,
        }}
      >
        Curve
      </Typography>
    </RouterLink>

    <Typography variant="bodySRegular" color="textSecondary" sx={{ textWrap: 'balance' }}>
      {t`Curve DAO is building the software that powers the future world economy: decentralised, trustless, inclusive and autonomous.`}
    </Typography>
  </Box>
)
