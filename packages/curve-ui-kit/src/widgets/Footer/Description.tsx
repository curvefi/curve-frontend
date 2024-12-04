import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { LogoImg } from 'ui/src/images'

const LogoImageSrc = (LogoImg as unknown as { src: string }).src
const Logo = styled('img')({
  width: 48,
  height: 48,
  margin: 8,
  alt: 'Curve',
})

export const Description = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '330px',
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
      <Logo src={LogoImageSrc} />

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

    <Typography
      variant="bodySRegular"
      color="textSecondary"
      sx={{
        lineHeight: '1rem',
      }}
    >
      Curve DAO is building the software that powers the future world economy: decentralised, trustless, inclusive and
      autonomous.
    </Typography>
  </Box>
)
