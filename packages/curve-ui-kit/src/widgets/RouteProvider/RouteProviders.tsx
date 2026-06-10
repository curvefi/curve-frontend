import { type ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { RouteProvider } from '@primitives/router.utils'
import { CURVE_LOGO_URL } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { EnsoIcon } from '@ui-kit/shared/icons/EnsoIcon'
import { OdosIcon } from '@ui-kit/shared/icons/OdosIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const iconSx = { width: IconSize.xs, height: IconSize.xs }

export const RouteProviderIcons: Record<RouteProvider, () => ReactNode> = {
  curve: () => <Box component="img" src={CURVE_LOGO_URL} alt="Curve" sx={iconSx} />,
  enso: () => <EnsoIcon sx={iconSx} />,
  odos: () => <OdosIcon sx={iconSx} />,
  '0x': () => <Box sx={{ ...iconSx, fontSize: 10, lineHeight: 1.6, textAlign: 'center' }}>0x</Box>,
}

export const RouteProviderLabels: Record<RouteProvider, string> = {
  curve: t`Curve`,
  enso: t`Enso`,
  odos: t`Odos`,
  '0x': t`0x`,
}
