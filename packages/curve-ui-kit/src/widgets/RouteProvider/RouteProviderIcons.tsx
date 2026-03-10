import { type ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { RouteProvider } from '@primitives/router.utils'
import { CURVE_LOGO_URL } from '@ui/utils'
import { EnsoIcon } from '@ui-kit/shared/icons/EnsoIcon'
import { OdosIcon } from '@ui-kit/shared/icons/OdosIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const iconSx = { width: IconSize.sm, height: IconSize.sm }

export const RouteProviderIcons: Record<RouteProvider, () => ReactNode> = {
  curve: () => <Box component="img" src={CURVE_LOGO_URL} alt="Curve" sx={iconSx} />,
  enso: () => <EnsoIcon sx={iconSx} />,
  odos: () => <OdosIcon sx={iconSx} />,
}
