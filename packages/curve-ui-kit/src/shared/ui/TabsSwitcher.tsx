import type { UrlObject } from 'url'
import Stack from '@mui/material/Stack'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import {
  TABS_SIZES_CLASSES,
  HIDE_INACTIVE_BORDERS_CLASS,
  TABS_VARIANT_CLASSES,
  TabSwitcherVariants,
  TAB_SUFFIX_CLASS,
  TAB_TEXT_VARIANTS,
} from '../../themes/components/tabs'

const { Spacing } = SizesAndSpaces

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href?: string | UrlObject
  suffix?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_SIZES_CLASSES
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  orientation?: TabsProps['orientation']
  value: T | undefined
  options: readonly TabOption<T>[]
  hideInactiveBorders?: boolean
  /** Tabs make use of all available width (so they're not as small and compact as possible) */
  fullWidth?: boolean
  onChange?: (value: T) => void
}

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'medium',
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
    className={`${TABS_VARIANT_CLASSES[variant]} ${TABS_SIZES_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`}
    sx={{ ...sx, ...(fullWidth && { '& .MuiTab-root': { flexGrow: 1 } }) }}
    {...props}
  >
    {options.map(({ value, label, href, startAdornment, endAdornment, suffix, ...props }) => (
      <Tab
        data-testid={`tab-${value}`}
        key={value}
        value={value}
        label={
          <Stack direction="row" alignItems="center" gap={Spacing.xxs}>
            {startAdornment}
            {(label || suffix) && (
              <Stack direction="row" alignItems="baseline" gap={Spacing.xxs}>
                {label && <Typography variant={textVariant ?? TAB_TEXT_VARIANTS[size]}>{label}</Typography>}
                {suffix && (
                  <Typography variant="highlightXs" className={TAB_SUFFIX_CLASS}>
                    {suffix}
                  </Typography>
                )}
              </Stack>
            )}
            {endAdornment}
          </Stack>
        }
        {...(href && { href, component: Link })}
        {...props}
      />
    ))}
  </Tabs>
)
