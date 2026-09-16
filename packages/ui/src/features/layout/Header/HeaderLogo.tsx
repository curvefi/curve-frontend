import { styled } from '@mui/material/styles'
import { RouterLink } from '@ui/components/RouterLink'
import type { SxProps } from '@ui/lib/mui'
import { CURVE_LOGO_URL } from '@ui/lib/resource.constants'

const Image = styled('img')({ width: 26, height: 26 })

type HeaderLogoProps = { sx?: SxProps }

export const HeaderLogo = ({ sx }: HeaderLogoProps) => (
  <RouterLink href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', ...sx }}>
    <Image src={CURVE_LOGO_URL} alt="Curve" />
  </RouterLink>
)
