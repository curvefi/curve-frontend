import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import * as React from 'react'
import Box from '@mui/material/Box'
import { LogoImg, RCLogoText } from 'ui/src/images'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { APP_NAMES } from './types'
import { AppName } from 'ui/src/AppNav/types'
import { SxProps, Theme } from '@mui/system'

const Image = styled('img')({
  width: 30,
  marginRight: 12
});

const LogoImageSrc = (LogoImg as unknown as { src: string }).src

export type HeaderLogoProps = {
  appName: AppName
  sx?: SxProps<Theme>
}

export const HeaderLogo = ({ appName, sx }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={LogoImageSrc} alt="Curve" width={30} />
    {appName ? (
      <Box display="inline-flex" flexDirection="column">
        <Typography
          variant="headingSBold"
          sx={{ textTransform: 'uppercase', lineHeight: '1.2rem' }}
          color="textPrimary"
        >
          {APP_NAMES[appName]}
        </Typography>
        <Typography variant="bodyXsRegular" color="grey.600">
          powered by Curve
        </Typography>
      </Box>
    ) : (
      <RCLogoText />
    )}
  </RouterLink>
)
