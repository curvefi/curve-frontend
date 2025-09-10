import type { UrlObject } from 'url'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import {
  TABS_HEIGHT_CLASSES,
  HIDE_INACTIVE_BORDERS_CLASS,
  TABS_VARIANT_CLASSES,
  TabSwitcherVariants,
} from '../../themes/components/tabs'

const defaultTextVariants = {
  small: 'buttonS',
  medium: 'buttonM',
  large: 'headingMBold',
} as const satisfies Record<keyof typeof TABS_HEIGHT_CLASSES, TypographyVariantKey>

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href?: string | UrlObject
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_HEIGHT_CLASSES
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  value: T | undefined
  options: readonly TabOption<T>[]
  hideInactiveBorders?: boolean
  /** Tabs make use of all available width (so they're not as small and compact as possible) */
  fullWidth?: boolean
  onChange?: (value: T) => void
}

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'small',
  muiVariant,
  options,
  onChange,
  value,
  textVariant,
  hideInactiveBorders = false,
  fullWidth = false,
  sx,
  ...props
}: TabsSwitcherProps<T>) => (
  <Tabs
    variant={muiVariant}
    textColor="inherit"
    value={value ?? false}
    onChange={(_, newValue) => onChange?.(newValue)}
    className={`${TABS_VARIANT_CLASSES[variant]} ${TABS_HEIGHT_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`}
    sx={{ ...sx, ...(fullWidth && { '& .MuiTab-root': { flexGrow: 1 } }) }}
    {...props}
  >
    {options.map(({ value, label, sx, href, ...props }) => (
      <Tab
        key={value}
        value={value}
        label={<Typography variant={textVariant ?? defaultTextVariants[size]}>{label}</Typography>}
        sx={{ ...sx, whiteSpace: 'nowrap' }}
        {...(href && { href, component: Link })}
        {...props}
      />
    ))}
  </Tabs>
)
