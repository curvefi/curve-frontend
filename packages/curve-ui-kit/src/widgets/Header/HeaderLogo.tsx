import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { LogoImg } from '@ui/images'
import type { AppMenuOption } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import type { SxProps } from '@ui-kit/utils'

const Image = styled('img')({
  width: 30,
  marginRight: 8,
})

const LogoImageSrc = (LogoImg as unknown as { src: string }).src

export type HeaderLogoProps = {
  currentMenu: AppMenuOption
  isLite: boolean
  sx?: SxProps
}

const APP_NAMES = {
  dex: 'Curve',
  lend: 'LLAMALEND',
  crvusd: 'crvUSD',
  dao: 'DAO',
} as const satisfies Record<AppMenuOption, string>

export const HeaderLogo = ({ currentMenu, isLite, sx }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={LogoImageSrc} alt="Curve" width={30} />
    <Box display="inline-flex" flexDirection="column">
      {/* Note: Anti-pattern to change the line height, however we want the subtitle to fit nicely */}
      <Typography
        variant="headingSBold"
        // One-off for the logo text (fixed size). Extra '&' specificity needed to override default.
        sx={{ '&': { lineHeight: '1.2rem' }, textTransform: 'none' }}
        color="textPrimary"
      >
        {APP_NAMES[currentMenu]}
      </Typography>
      {currentMenu === 'dex' ? (
        isLite && (
          <Typography variant="bodyXsBold" color="textTertiary">
            Lite
          </Typography>
        )
      ) : (
        <Typography variant="bodyXsRegular" color="textTertiary">
          powered by Curve
        </Typography>
      )}
    </Box>
  </RouterLink>
)
