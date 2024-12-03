import * as React from 'react'
import Box from '@mui/material/Box'
import { LogoImg, RCLogoText } from 'ui/src/images'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { APP_NAMES } from './types'
import type { SxProps, Theme } from '@mui/system'
import { AppName } from 'curve-ui-kit/src/shared/routes'

const Image = styled('img')({
  width: 30,
  marginRight: 8
});

const LogoImageSrc = (LogoImg as unknown as { src: string }).src

export type HeaderLogoProps = {
  appName: AppName
  isLite: boolean
  sx?: SxProps<Theme>
}

export const HeaderLogo = ({ appName, isLite, sx }: HeaderLogoProps) => (
  <Link href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={LogoImageSrc} alt="Curve" width={30} />
    {appName ? (
      <Box display="inline-flex" flexDirection="column">
        <Typography variant="headingSBold" sx={{ marginBottom: 0, lineHeight: '1.2rem', textTransform: 'none' }} color="textPrimary">
          {APP_NAMES[appName]}
        </Typography>
        {appName === 'main' ? (
          isLite && (
            <Typography variant="bodyXsBold" color="textTertiary" sx={{marginBottom: 0}}>
              Lite
            </Typography>
          )
        ) : (
          <Typography variant="bodyXsRegular" color="textTertiary" sx={{marginBottom: 0}}>
            powered by Curve
          </Typography>
        )}
      </Box>
    ) : (
      <RCLogoText />
    )}
  </Link>
)
