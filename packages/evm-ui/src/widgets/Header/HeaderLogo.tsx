import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import type { SxProps } from '@evm-ui/utils'
import { CURVE_LOGO_URL } from '@legacy-ui/utils'
import { styled } from '@mui/material/styles'

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
