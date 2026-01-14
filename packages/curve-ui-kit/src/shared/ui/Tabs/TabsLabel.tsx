import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { TAB_SUFFIX_CLASS } from '@ui-kit/themes/components/tabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TabOption } from './TabsSwitcher'

const { Spacing } = SizesAndSpaces

export const TabLabel = <T extends string | number>({
  label,
  labelVariant,
  suffix,
  startAdornment,
  endAdornment,
}: Pick<TabOption<T>, 'label' | 'suffix' | 'startAdornment' | 'endAdornment'> & {
  labelVariant: TypographyProps['variant']
}) => (
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
