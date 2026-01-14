import type { UrlObject } from 'url'
import { useMemo, type ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTabsOverflow } from '../../../hooks/useTabsOverflow'
import {
  TABS_SIZES_CLASSES,
  HIDE_INACTIVE_BORDERS_CLASS,
  TABS_VARIANT_CLASSES,
  TabSwitcherVariants,
  TAB_TEXT_VARIANTS,
} from '../../../themes/components/tabs'
import { KEBAB_TAB_VALUE, KebabMenu, KebabTab } from './tabs-kebab'
import { TabLabel } from './TabsLabel'

const { Spacing } = SizesAndSpaces

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href?: string | UrlObject
  /** The suffix of the tab. It's rendered after the label and before the end adornment. */
  suffix?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  /**  If true, the tab will always be in the kebab menu, even if there is enough space to show it.*/
  alwaysInKebab?: boolean
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_SIZES_CLASSES
  variant?: TabSwitcherVariants
  /** The overflow behavior of the tabs. This is directly mapped to the MUI's variant prop. Note that "kebab" mode overrides the "scrollable" variant */
  overflow?: Exclude<TabsProps['variant'], 'scrollable'> | 'kebab'
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
  const {
    renderedOptions,
    visibleOptions,
    hiddenOptions,
    visibleTabsRef,
    kebabTabRef,
    kebabMenuOpen,
    openKebabMenu,
    closeKebabMenu,
  } = useTabsOverflow(options, isKebabMode)

  const tabsValue = useMemo(
    () => (visibleOptions.some((option) => option.value === value) ? value : false),
    [visibleOptions, value],
  )
  const kebabTabsValue = useMemo(
    () => (isKebabMode && hiddenOptions.some((option) => option.value === value) ? KEBAB_TAB_VALUE : false),
    [isKebabMode, hiddenOptions, value],
  )
  const hiddenValues = useMemo(() => new Set(hiddenOptions.map((option) => option.value)), [hiddenOptions])
  const hasHiddenTabs = isKebabMode && hiddenOptions.length > 0

  const labelVariant = textVariant ?? TAB_TEXT_VARIANTS[size]
  const tabsClassName = `${TABS_VARIANT_CLASSES[variant]} ${TABS_SIZES_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`

  return (
    <Stack direction="row" justifyContent="space-between" gap={Spacing.xs} width={isKebabMode ? '100%' : undefined}>
      <Stack ref={visibleTabsRef} sx={{ flex: 1, minWidth: 0 }}>
        <Tabs
          variant={overflowToMuiVariant[overflow]}
          textColor="inherit"
          value={tabsValue}
          onChange={(_, newValue) => onChange?.(newValue as T)}
          scrollButtons={false}
          className={tabsClassName}
          sx={{
            ...sx,
            ...(fullWidth && { '& .MuiTab-root': { flexGrow: 1 } }),
            ...(isKebabMode && { width: '100%' }),
          }}
          {...props}
        >
          {renderedOptions.map(
            ({ value: val, label, href, startAdornment, endAdornment, suffix, sx: tabSx, ...props }) => (
              <Tab
                data-testid={`${testIdPrefix}-${val}`}
                key={val}
                value={val}
                label={
                  <TabLabel
                    label={label}
                    labelVariant={labelVariant}
                    suffix={suffix}
                    startAdornment={startAdornment}
                    endAdornment={endAdornment}
                  />
                }
                sx={{
                  ...tabSx,
                  ...(isKebabMode &&
                    hiddenValues.has(val) && { visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }),
                }}
                {...(href && { href, component: Link })}
                {...props}
              />
            ),
          )}
          {children}
        </Tabs>
      </Stack>

      {/* Kebab tab button */}
      {hasHiddenTabs && (
        <KebabTab
          kebabTabsValue={kebabTabsValue}
          kebabTabRef={kebabTabRef}
          tabsClassName={tabsClassName}
          testIdPrefix={testIdPrefix}
          openKebabMenu={openKebabMenu}
          size={size}
        />
      )}

      {/* Kebab menu content */}
      {isKebabMode && hasHiddenTabs && kebabMenuOpen != null && (
        <KebabMenu
          kebabMenuOpen={kebabMenuOpen}
          kebabTabRef={kebabTabRef}
          closeKebabMenu={closeKebabMenu}
          hiddenOptions={hiddenOptions}
          labelVariant={labelVariant}
          onChange={onChange}
          tabsClassName={tabsClassName}
          value={value}
        />
      )}
    </Stack>
  )
}
