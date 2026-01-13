import type { UrlObject } from 'url'
import { type ReactNode } from 'react'
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

const { Spacing, ButtonSize } = SizesAndSpaces

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
  overflow?: 'standard' | 'scrollable' | 'kebab'
  muiVariant?: TabsProps['variant']
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

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'medium',
  overflow = 'standard',
  muiVariant,
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
  const isKebabMode = overflow === 'kebab'
  const {
    visibleOptions,
    hiddenOptions,
    showKebabButton,
    isKebabOpen,
    anchorEl,
    setAnchorEl,
    tabsContainerRef,
    measureRef,
  } = useTabsOverflow(options, isKebabMode, value)

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
  const finalMuiVariant = muiVariant ?? (overflow === 'scrollable' ? 'scrollable' : 'standard')
  const tabsSx = {
    ...sx,
    ...(fullWidth && { '& .MuiTab-root': { flexGrow: 1 } }),
    ...(isKebabMode && { width: '100%' }),
    ...(showKebabButton && { paddingRight: ButtonSize.sm }),
  }
  const tabsClassName = `${TABS_VARIANT_CLASSES[variant]} ${TABS_SIZES_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`

  return (
    <Stack ref={tabsContainerRef} sx={{ position: 'relative' }}>
      <Tabs
        variant={finalMuiVariant}
        textColor="inherit"
        value={tabsValue}
        onChange={(_, newValue) => onChange?.(newValue as T)}
        className={tabsClassName}
        sx={tabsSx}
        {...props}
      >
        {visibleOptions.map(
          ({ value: val, label, href, startAdornment, endAdornment, alwaysInKebab, suffix, ...props }) => (
            <Tab
              data-testid={`${testIdPrefix}-${val}`}
              key={val}
              value={val}
              label={renderTabLabel({ label, suffix, startAdornment, endAdornment })}
              {...(href && { href, component: Link })}
              {...props}
            />
          ),
        )}
        {children}
      </Tabs>
      {showKebabButton && (
        <Tabs
          value={kebabTabsValue}
          textColor="inherit"
          className={tabsClassName}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 1,
            minHeight: 0,
          }}
        >
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
      )}

      {/* Kebab menu content */}
      {isKebabMode && (
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

      {/* Measure ref for calculating tab widths. Not visible to the user. */}
      {isKebabMode && (
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{ position: 'absolute', top: -10000, left: -10000, visibility: 'hidden', pointerEvents: 'none' }}
        >
          <TabsSwitcher
            variant={variant}
            size={size}
            value={value}
            options={options}
            muiVariant="standard"
            testIdPrefix="measure-tab"
          />
        </div>
      )}
    </Stack>
  )
}
