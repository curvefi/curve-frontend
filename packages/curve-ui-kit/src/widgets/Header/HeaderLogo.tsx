import { styled } from '@mui/material/styles'
import { CURVE_LOGO_URL } from '@ui/utils'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import type { SxProps } from '@ui-kit/utils'

const Image = styled('img')({
  width: 26,
  height: 26,
})

export type HeaderLogoProps = {
  sx?: SxProps
}

export const HeaderLogo = ({ sx }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={CURVE_LOGO_URL} alt="Curve" />
  </RouterLink>
)
