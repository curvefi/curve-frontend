import { ReactNode } from 'react'
import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { TAB_SUFFIX_CLASS, TAB_TEXT_VARIANTS } from '@ui-kit/themes/components/tabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { WithWrapper } from '../WithWrapper'
import { TabOption, TabsSwitcherProps } from './TabsSwitcher'

const { Spacing } = SizesAndSpaces

type TabLabelProps<T extends string | number> = Pick<
  TabOption<T>,
  'label' | 'suffix' | 'startAdornment' | 'endAdornment'
> & {
  size: NonNullable<TabsSwitcherProps<T>['size']>
}

type WithTypographyProps<T extends string | number> = {
  shouldWrap: boolean
  size: TabLabelProps<T>['size']
  children: ReactNode
} & TypographyProps

/**
 * A component that wraps children with a Typography for preserving line height and a Box for alignment.
 * Used to align the adornments when there is no text, but still preserve the line height of the typography.
 */
const WithTypography = <T extends string | number>({
  shouldWrap,
  size,
  variant,
  ...typographyProps
}: WithTypographyProps<T>) => (
  <WithWrapper
    Wrapper={({ children }: { children: ReactNode }) => (
      <Typography variant={TAB_TEXT_VARIANTS[size]}>
        {/* minHeight: '1lh' is necessary to preserve the line height of the typography, otherwise the height would collapse because there is no text */}
        <Box style={{ minHeight: '1lh', display: 'flex', alignItems: 'center' }}>{children}</Box>
      </Typography>
    )}
    shouldWrap={shouldWrap}
    {...typographyProps}
  />
)

export const TabLabel = <T extends string | number>({
  label,
  size,
  suffix,
  startAdornment,
  endAdornment,
}: TabLabelProps<T>) => {
  const hasText = label || suffix
  return (
    <Stack direction="row" alignItems="center" gap={Spacing.xxs}>
      <WithTypography size={size} shouldWrap={!hasText && !!startAdornment}>
        {startAdornment}
      </WithTypography>
      {hasText && (
        <Stack direction="row" alignItems="baseline" gap={Spacing.xxs}>
          {label && <Typography variant={TAB_TEXT_VARIANTS[size]}>{label}</Typography>}
          {suffix && (
            <Typography variant="highlightXs" className={TAB_SUFFIX_CLASS}>
              {suffix}
            </Typography>
          )}
        </Stack>
      )}
      <WithTypography size={size} shouldWrap={!hasText && !!endAdornment}>
        {endAdornment}
      </WithTypography>
    </Stack>
  )
}
