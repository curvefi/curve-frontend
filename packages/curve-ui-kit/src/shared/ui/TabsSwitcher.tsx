import type { UrlObject } from 'url'
import { useMemo, useState, type ReactNode } from 'react'
import Icon from 'ui/src/Icon'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTabsOverflow } from '../../hooks/useTabsOverflow'
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
  alwaysInKebab?: boolean
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_SIZES_CLASSES
  variant?: TabSwitcherVariants
  overflow?: 'standard' | 'kebab' | 'fullWidth'
  textVariant?: TypographyProps['variant']
  orientation?: TabsProps['orientation']
  value: T | undefined
  options: readonly TabOption<T>[]
  hideInactiveBorders?: boolean
  /** Tabs make use of all available width (so they're not as small and compact as possible) */
  fullWidth?: boolean
  onChange?: (value: T) => void
  testIdPrefix?: string
  children?: ReactNode
}

const KEBAB_TAB_VALUE = '__kebab__'

const overflowToMuiVariant: Record<
  NonNullable<TabsSwitcherProps<string>['overflow']>,
  NonNullable<TabsProps['variant']>
> = {
  standard: 'standard',
  kebab: 'scrollable',
  fullWidth: 'fullWidth',
}

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'medium',
  overflow = 'standard',
  options,
  onChange,
  value,
  textVariant,
  hideInactiveBorders = false,
  fullWidth = false,
  testIdPrefix = 'tab',
  sx,
  children,
  ...props
}: TabsSwitcherProps<T>) => {
  // TODO: make kebab mode only available in vertical orientation
  const isKebabMode = overflow === 'kebab' && props.orientation !== 'vertical'
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isKebabOpen = !!anchorEl
  const { renderedOptions, visibleOptions, hiddenOptions, visibleTabsRef } = useTabsOverflow(
    options,
    isKebabMode,
    value,
  )

  const isActiveTabHidden = isKebabMode && hiddenOptions.some((option) => option.value === value)
  const isActiveTabVisible = visibleOptions.some((option) => option.value === value)
  const tabsValue = isActiveTabVisible ? value : false
  const kebabTabsValue = isActiveTabHidden ? KEBAB_TAB_VALUE : false
  const labelVariant = textVariant ?? TAB_TEXT_VARIANTS[size]
  const renderTabLabel = ({
    label,
    suffix,
    startAdornment,
    endAdornment,
  }: Pick<TabOption<T>, 'label' | 'suffix' | 'startAdornment' | 'endAdornment'>) => (
    <Stack direction="row" alignItems="center" gap={Spacing.xxs}>
      {startAdornment}
      {(label || suffix) && (
        <Stack direction="row" alignItems="baseline" gap={Spacing.xxs}>
          {label && <Typography variant={labelVariant}>{label}</Typography>}
          {suffix && (
            <Typography variant="highlightXs" className={TAB_SUFFIX_CLASS}>
              {suffix}
            </Typography>
          )}
        </Stack>
      )}
      {endAdornment}
    </Stack>
  )
  const tabsSx = {
    ...sx,
    ...(fullWidth && { '& .MuiTab-root': { flexGrow: 1 } }),
    ...(isKebabMode && { width: '100%' }),
  }
  const tabsClassName = `${TABS_VARIANT_CLASSES[variant]} ${TABS_SIZES_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`
  const hasHiddenTabs = isKebabMode && hiddenOptions.length > 0
  const hiddenValues = useMemo(() => new Set(hiddenOptions.map((option) => option.value)), [hiddenOptions])

  return (
    <Stack direction="row" justifyContent="space-between" gap={Spacing.xs}>
      <Stack ref={visibleTabsRef} sx={{ flex: 1, minWidth: 0 }}>
        <Tabs
          variant={overflowToMuiVariant[overflow]}
          textColor="inherit"
          value={tabsValue}
          onChange={(_, newValue) => onChange?.(newValue as T)}
          className={tabsClassName}
          sx={tabsSx}
          {...props}
        >
          {renderedOptions.map(
            ({ value: val, label, href, startAdornment, endAdornment, suffix, sx: tabSx, ...props }) => {
              const isHidden = isKebabMode && hiddenValues.has(val)
              return (
                <Tab
                  data-testid={`${testIdPrefix}-${val}`}
                  key={val}
                  value={val}
                  label={renderTabLabel({ label, suffix, startAdornment, endAdornment })}
                  sx={{
                    ...tabSx,
                    ...(isHidden && { visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }),
                  }}
                  {...(href && { href, component: Link })}
                  {...props}
                />
              )
            },
          )}
          {children}
        </Tabs>
      </Stack>
      {hasHiddenTabs && (
        <Stack sx={{ flexShrink: 0 }}>
          <Tabs value={kebabTabsValue} textColor="inherit" className={tabsClassName} sx={{ minHeight: 0 }}>
            <Tab
              aria-label="More tabs"
              data-testid={`${testIdPrefix}-kebab`}
              value={KEBAB_TAB_VALUE}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              label={renderTabLabel({
                label: null,
                startAdornment: (
                  <Typography variant={labelVariant}>
                    <Icon name="OverflowMenuVertical" size={20} />
                  </Typography>
                ),
              })}
            />
          </Tabs>
        </Stack>
      )}

      {/* Kebab menu content */}
      {isKebabMode && hasHiddenTabs && (
        <Popover
          open={isKebabOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: { padding: Spacing.md, backgroundColor: (t) => t.design.Layer[1].Fill },
            },
          }}
        >
          <Tabs
            orientation="vertical"
            variant="standard"
            textColor="inherit"
            value={value ?? false}
            onChange={(_, newValue) => {
              onChange?.(newValue as T)
              setAnchorEl(null)
            }}
            className={tabsClassName}
          >
            {hiddenOptions.map(
              ({ value: val, label, href, startAdornment, endAdornment, alwaysInKebab, suffix, ...props }) => (
                <Tab
                  key={val}
                  value={val}
                  label={renderTabLabel({ label, suffix, startAdornment, endAdornment })}
                  {...(href && { href, component: Link })}
                  {...props}
                />
              ),
            )}
          </Tabs>
        </Popover>
      )}
    </Stack>
  )
}
