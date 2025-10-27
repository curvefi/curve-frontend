import Stack from '@mui/material/Stack'
import { Slider } from './Slider'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { NumericTextField } from './NumericTextField'
import { SliderSize } from '@ui-kit/themes/components/slider/types'
import { TextFieldProps } from '@mui/material'

const { Spacing, MaxWidth } = SizesAndSpaces

type SliderInputProps = {
  /** The direction of the layout. Row: inputs on the left and right of the slider. Column: inputs below the slider. */
  layoutDirection?: 'column' | 'row'
  /** The size of the slider and inputs. Sizes of the inputs are calculated based on the size of the slider. */
  size?: SliderSize
}

/**
 * Mapping between the slider sizes and correspoding input sizes
 */
const sliderInputSizeMap: Record<SliderSize, TextFieldProps['size']> = {
  small: 'tiny',
  medium: 'tiny',
}
/**
 * Mapping between the layout direction and correspoding max width of the input
 */
const sliderInputMaxWidthMap: Record<NonNullable<SliderInputProps['layoutDirection']>, string> = {
  row: MaxWidth.sliderInput.sm,
  column: MaxWidth.sliderInput.md,
}

export const SliderInput = ({ layoutDirection = 'row', size = 'medium' }: SliderInputProps) => {
  const input = (
    <NumericTextField
      placeholder="0"
      size={sliderInputSizeMap[size]}
      variant="filled"
      value={'2'}
      min="0"
      sx={{ maxWidth: sliderInputMaxWidthMap[layoutDirection] }}
    />
  )

  return (
    <Stack direction={layoutDirection} alignItems="center" columnGap={Spacing.sm} rowGap={Spacing.xs}>
      {layoutDirection === 'row' ? (
        <>
          {input}
          <Slider size={size} />
          {input}
        </>
      ) : (
        <>
          <Slider size={size} />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            columnGap={Spacing.sm}
            rowGap={Spacing.xs}
            width="100%"
          >
            {input}
            {input}
          </Stack>
        </>
      )}
    </Stack>
  )
}
