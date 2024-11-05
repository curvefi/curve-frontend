import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import * as React from 'react'
import { Box } from 'curve-ui-kit/src/shared/ui/Box'
import { LogoImg, RCLogoText } from 'ui/src/images'
import { styled } from '@mui/material/styles'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'
import { APP_NAMES } from './types'
import { AppName } from 'ui/src/AppNav/types'

const Image = styled('img')({
  width: 30,
  marginRight: 12
});

const LogoImageSrc = (LogoImg as unknown as { src: string }).src

export type HeaderLogoProps = {
  appName?: AppName
}

export const HeaderLogo = ({ appName }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
    <Image src={LogoImageSrc} alt="Curve" width={30} />
    {appName ? (
      <Box display="inline-flex" flexDirection="column" sx={{ verticalAlign: 'top' }}>
        <Typography
          variant="headingSBold"
          sx={{ textTransform: 'uppercase' }}
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
