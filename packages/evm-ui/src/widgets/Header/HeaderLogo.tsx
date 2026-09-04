import { styled } from '@mui/material/styles'
import { RouterLink } from '@ui/components/RouterLink'
import { CURVE_LOGO_URL } from '@ui/lib/resource.constants'
import type { SxProps } from '@ui/utils/mui'

const Image = styled('img')({
  width: 26,
  height: 26,
})

type HeaderLogoProps = {
  sx?: SxProps
}

export const HeaderLogo = ({ sx }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={CURVE_LOGO_URL} alt="Curve" />
  </RouterLink>
)
