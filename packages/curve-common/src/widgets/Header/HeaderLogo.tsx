import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import * as React from 'react'
import { Box } from 'curve-ui-kit/src/shared/ui/Box'
import { LogoImg, RCLogoText } from 'ui/src/images'
import { styled } from '@mui/material/styles'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

const Image = styled('img')({
  width: 30,
  marginRight: 12
});

const LogoImageSrc = (LogoImg as unknown as { src: string }).src

export type HeaderLogoProps = {
  appName?: string
}

export const HeaderLogo = ({ appName }: HeaderLogoProps) => (
  <RouterLink href="/">
    <Image src={LogoImageSrc} alt="Curve" width={30} />
    {appName ? (
      <Box display="inline-flex" flexDirection="column" sx={{ verticalAlign: 'top' }}>
        <Typography variant="headingSBold" sx={{ textTransform: 'uppercase', textDecoration: 'none' }}
                    color="textPrimary">
          {appName}
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
