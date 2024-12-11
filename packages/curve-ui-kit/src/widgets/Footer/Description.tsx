import { t } from '@lingui/macro'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { RCLogoSM } from 'ui/src/images'

export const Description = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      mr: '1.5rem',
    }}
  >
    <Link
      href="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      <RCLogoSM
        style={{
          width: '48px',
          height: '48px',
          margin: '8px',
        }}
      />

      <Typography
        color="textPrimary"
        sx={{
          fontSize: '2.75rem',
          fontWeight: 'bold',
        }}
      >
        Curve
      </Typography>
    </Link>

    <Typography variant="bodySRegular" color="textSecondary">
      {t`Curve DAO is building the software that powers the future world economy: decentralised, trustless, inclusive and autonomous.`}
    </Typography>
  </Box>
)
