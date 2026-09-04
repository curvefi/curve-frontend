import { type ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { RouteProvider } from '@primitives/router.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { EnsoIcon } from '@ui/icons/EnsoIcon'
import { t } from '@ui/lib/i18n'
import { CURVE_LOGO_GRAYSCALE_URL, CURVE_LOGO_URL } from '@ui/lib/resource.constants'

const { IconSize } = SizesAndSpaces

const iconSx = { width: IconSize.xs, height: IconSize.xs }

export const RouteProviderIcons: Record<RouteProvider, () => ReactNode> = {
  curve: () => <Box component="img" src={CURVE_LOGO_GRAYSCALE_URL} alt="Curve" sx={iconSx} />,
  'curve-solver': () => <Box component="img" src={CURVE_LOGO_URL} alt="Curve Solver" sx={iconSx} />,
  enso: () => <EnsoIcon sx={iconSx} />,
  '0x': () => <Box sx={{ ...iconSx, fontSize: 10, lineHeight: 1.6, textAlign: 'center' }}>0x</Box>,
}

export const RouteProviderLabels: Record<RouteProvider, string> = {
  curve: t`Curve`,
  'curve-solver': t`Curve Solver`,
  enso: t`Enso`,
  '0x': t`0x`,
}
