import { t } from '@evm-ui/lib/i18n'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { Sizing } from '@evm-ui/themes/design/0_primitives'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { CURVE_LOGO_URL } from '@legacy-ui/utils'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

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
