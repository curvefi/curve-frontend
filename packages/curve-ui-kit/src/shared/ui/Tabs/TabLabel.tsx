import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { TAB_SUFFIX_CLASS, TAB_TEXT_VARIANTS } from '@ui-kit/themes/components/tabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TabOption, TabsSwitcherProps } from './TabsSwitcher'

const { Spacing } = SizesAndSpaces

type TabLabelProps<T extends string | number> = Pick<
  TabOption<T>,
  'label' | 'suffix' | 'startAdornment' | 'endAdornment'
> & {
  size: NonNullable<TabsSwitcherProps<T>['size']>
  textVariant?: TypographyProps['variant']
}

export const TabLabel = <T extends string | number>({
  label,
  size,
  suffix,
  startAdornment,
  endAdornment,
  textVariant,
}: TabLabelProps<T>) => (
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
)
