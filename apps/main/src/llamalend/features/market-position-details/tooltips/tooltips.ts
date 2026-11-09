import { createElement } from 'react'
import { t } from '@ui/lib/i18n'
import { LegacyHealthTooltipContent } from './LegacyHealthTooltipContent'

export const LEGACY_HEALTH_TOOLTIP = { title: t`Health`, body: createElement(LegacyHealthTooltipContent) } as const
