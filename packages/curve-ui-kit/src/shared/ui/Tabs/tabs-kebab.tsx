import { type RefObject } from 'react'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DotsVerticalIcon } from '../../icons/DotsVertical'
import { TabLabel } from './TabsLabel'
import { TabOption } from './TabsSwitcher'

type KebabTabProps = {
  kebabTabsValue: string | false
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
  labelVariant: TypographyProps['variant']
  onChange?: (value: T) => void
  tabsClassName: string
  value: T | undefined
}

export const KEBAB_TAB_VALUE = '__kebab__'

const { Spacing } = SizesAndSpaces

export const KebabTab = ({
  kebabTabsValue,
  kebabTabRef,
  tabsClassName,
  testIdPrefix,
  openKebabMenu,
}: KebabTabProps) => (
  <Stack sx={{ flexShrink: 0 }}>
    <Tabs value={kebabTabsValue} textColor="inherit" className={tabsClassName} sx={{ minHeight: 0 }}>
      <Tab
        aria-label="More tabs"
        ref={kebabTabRef}
        data-testid={`${testIdPrefix}-kebab`}
        value={KEBAB_TAB_VALUE}
        onClick={openKebabMenu}
        label={
          <TabLabel
            labelVariant={undefined}
            startAdornment={
              <Typography>
                <DotsVerticalIcon fontSize="small" />
              </Typography>
            }
          />
        }
      />
    </Tabs>
  </Stack>
)

export const KebabMenu = <T extends string | number>({
  kebabMenuOpen,
  kebabTabRef: { current: kebabTabEl },
  closeKebabMenu,
  hiddenOptions,
  labelVariant,
  onChange,
  tabsClassName,
  value,
}: KebabMenuProps<T>) =>
  kebabTabEl && (
    <Popover
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
        orientation="vertical"
        textColor="inherit"
        value={value ?? false}
        onChange={(_, newValue) => {
          onChange?.(newValue as T)
          closeKebabMenu()
        }}
        className={tabsClassName}
      >
        {hiddenOptions.map(({ value: val, label, href, startAdornment, endAdornment, suffix, ...props }) => (
          <Tab
            key={val}
            value={val}
            label={
              <TabLabel
                label={label}
                suffix={suffix}
                startAdornment={startAdornment}
                endAdornment={endAdornment}
                labelVariant={labelVariant}
              />
            }
            {...(href && { href, component: Link })}
            {...props}
          />
        ))}
      </Tabs>
    </Popover>
  )
