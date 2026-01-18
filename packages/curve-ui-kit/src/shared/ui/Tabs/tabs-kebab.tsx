import { type RefObject } from 'react'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DotsVerticalIcon } from '../../icons/DotsVertical'
import { TabLabel } from './TabsLabel'
import { TabOption, TabsSwitcherProps } from './TabsSwitcher'

type KebabTabProps<T> = {
  size: NonNullable<TabsSwitcherProps<T>['size']>
  kebabTabsValue: string | boolean
  kebabTabRef: RefObject<HTMLDivElement | null>
  tabsClassName: string
  testIdPrefix: string
  openKebabMenu: () => void
}

type KebabMenuProps<T> = {
  kebabMenuOpen: boolean
  kebabTabRef: RefObject<HTMLDivElement | null>
  closeKebabMenu: () => void
  hiddenOptions: readonly TabOption<T>[]
  size: NonNullable<TabsSwitcherProps<T>['size']>
  textVariant?: TypographyProps['variant']
  onChange?: (value: T) => void
  tabsClassName: string
  value: T | boolean
  testIdPrefix: string
}

export const KEBAB_TAB_VALUE = '__kebab__'

const { Spacing, IconSize } = SizesAndSpaces

export const SIZE_TO_ICON_SIZE = {
  small: IconSize.sm,
  medium: IconSize.md,
  extraExtraLarge: IconSize.lg,
} as const

export const KebabTab = <T extends string | number>({
  kebabTabsValue,
  size,
  kebabTabRef,
  tabsClassName,
  testIdPrefix,
  openKebabMenu,
}: KebabTabProps<T>) => {
  const iconSize = SIZE_TO_ICON_SIZE[size]
  return (
    <Stack sx={{ flexShrink: 0 }}>
      <Tabs value={kebabTabsValue} textColor="inherit" className={tabsClassName} sx={{ minHeight: 0 }}>
        <Tab
          aria-label="More tabs"
          ref={kebabTabRef}
          data-testid={`${testIdPrefix}-kebab-button`}
          value={KEBAB_TAB_VALUE}
          onClick={openKebabMenu}
          label={
            <TabLabel size={size} startAdornment={<DotsVerticalIcon sx={{ width: iconSize, height: iconSize }} />} />
          }
        />
      </Tabs>
    </Stack>
  )
}

export const KebabMenu = <T extends string | number>({
  kebabMenuOpen,
  kebabTabRef: { current: kebabTabEl },
  closeKebabMenu,
  hiddenOptions,
  size,
  textVariant,
  onChange,
  tabsClassName,
  value,
  testIdPrefix,
}: KebabMenuProps<T>) =>
  kebabTabEl && (
    <Popover
      data-testid={`${testIdPrefix}-kebab-menu`}
      open={kebabMenuOpen}
      anchorEl={kebabTabEl}
      onClose={closeKebabMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: { padding: Spacing.md, backgroundColor: (t) => t.design.Layer[1].Fill },
        },
      }}
    >
      <Tabs
        data-testid={`${testIdPrefix}-kebab-tabs`}
        orientation="vertical"
        textColor="inherit"
        value={value}
        onChange={(_, newValue) => {
          onChange?.(newValue as T)
          closeKebabMenu()
        }}
        className={tabsClassName}
      >
        {hiddenOptions.map(
          ({
            value: val,
            label,
            href,
            startAdornment,
            endAdornment,
            suffix,
            // avoids passing the alwaysInKebab prop to the DOM element
            alwaysInKebab: _alwaysInKebab,
            ...props
          }) => (
            <Tab
              key={val}
              value={val}
              label={
                <TabLabel
                  label={label}
                  suffix={suffix}
                  startAdornment={startAdornment}
                  endAdornment={endAdornment}
                  size={size}
                  textVariant={textVariant}
                />
              }
              {...(href && { href, component: Link })}
              {...props}
            />
          ),
        )}
      </Tabs>
    </Popover>
  )
