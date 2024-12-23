import { t } from '@lingui/macro'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import SvgIcon from '@mui/material/SvgIcon'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { Sizing } from 'curve-ui-kit/src/themes/design/0_primitives'

import { RCLogoSM } from 'ui/src/images'

const { IconSize, Spacing, FontWeight } = SizesAndSpaces

export const Description = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Link
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
    </Link>

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
