import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Tab, { type TabProps } from '@mui/material/Tab'
import { TabSwitcherVariants, TABS_VARIANT_CLASSES, TABS_HEIGHT_CLASSES } from '../../themes/tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href?: string
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_HEIGHT_CLASSES
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  value: T | undefined
  options: TabOption<T>[]
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
  ...props
}: TabsSwitcherProps<T>) => (
  <Tabs
    variant={muiVariant}
    textColor="inherit"
    value={value ?? false}
    onChange={(_, newValue) => onChange?.(newValue)}
    className={`${TABS_VARIANT_CLASSES[variant]} ${TABS_HEIGHT_CLASSES[size]}`}
    {...props}
  >
    {options.map(({ value, label, ...props }) => (
      <Tab key={value} value={value} label={<Typography variant={textVariant}>{label}</Typography>} {...props} />
    ))}
  </Tabs>
)
