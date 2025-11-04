import { TextFieldProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import { SliderSize } from '@ui-kit/themes/components/slider/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Decimal } from '@ui-kit/utils'
import { NumericTextField, NumericTextFieldProps } from './NumericTextField'
import { Slider, type SliderProps } from './Slider'

const { Spacing, MaxWidth } = SizesAndSpaces

export type RangeValue = [number, number]

export type SliderInputProps = {
  /** The aria-label */
  ariaLabel?: string
  /** The direction of the layout. Row: inputs on the left and right of the slider. Column: inputs below the slider. */
  layoutDirection?: 'column' | 'row'
  /** The size of the slider and inputs. Sizes of the inputs are calculated based on the size of the slider. */
  size?: SliderSize
  /** Value controlled by the slider and inputs. Pass an array to enable a range slider. */
  value: number | RangeValue
  /** Change handler shared between the slider and inputs. Receives either a number or a RangeValue. */
  onChange: (value: number | [number, number]) => void
  /** Minimum allowed value for both inputs and slider */
  min?: number
  /** Maximum allowed value for both inputs and slider */
  max?: number
  /** Step increment for the slider */
  step?: number
  /** Propagated to both inputs and slider */
  disabled?: boolean
  /** Optional transform that maps values between the inputs and the slider */
  sliderValueTransform?: {
    toSlider: (value: number) => number
    fromSlider: (value: number) => number
    sliderMin?: number
    sliderMax?: number
    sliderStep?: number | null
  }
  /** Test ID for the slider and inputs */
  testId?: string
  /** Additional props forwarded to the slider */
  sliderProps?: Omit<SliderProps, 'size' | 'value' | 'onChange' | 'step' | 'disabled' | 'aria-label' | 'scale'>
  /** Additional props forwarded to the inputs */
  inputProps?: Omit<NumericTextFieldProps, 'size' | 'value' | 'onChange' | 'min' | 'max' | 'disabled' | 'aria-label'>
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
/**
 * Converts a number to a Decimal typed string.
 */
const toDecimal = (value: number | undefined): Decimal | undefined =>
  value == null || Number.isNaN(value) ? undefined : (`${value}` as Decimal)

export const SliderInput = ({
  ariaLabel,
  layoutDirection = 'row',
  size = 'medium',
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  sliderProps,
  inputProps,
  sliderValueTransform,
  testId,
}: SliderInputProps) => {
  const isRange = Array.isArray(value)

  // the value of the first input / left side of the slider range. Or the value of the input/slider if there is no range
  const currentFirst = isRange ? value[0] : value
  // the value of the second input / right side of the slider range. Or the value of the input/slider if there is no range
  const currentSecond = isRange ? value[1] : value

  /** Translate the stored value into whatever space the slider expects. */
  const mapToSliderValue = sliderValueTransform?.toSlider ?? ((sliderValue: number) => sliderValue)
  /** Transform slider values back into the original value space used by the inputs. */
  const mapFromSliderValue = sliderValueTransform?.fromSlider ?? ((sliderValue: number) => sliderValue)

  const sliderValue: number | RangeValue = isRange
    ? ([mapToSliderValue(currentFirst), mapToSliderValue(currentSecond)] as RangeValue)
    : mapToSliderValue(currentSecond)

  const sliderMinValue = sliderValueTransform?.sliderMin ?? min
  const sliderMaxValue = sliderValueTransform?.sliderMax ?? max
  const sliderStepValue = sliderValueTransform?.sliderStep ?? step

  const handleSliderChange: SliderProps['onChange'] = (_event, newValue) => {
    if (Array.isArray(newValue)) {
      const [first, second] = newValue
      onChange([mapFromSliderValue(first), mapFromSliderValue(second)])
      return
    }

    onChange(mapFromSliderValue(newValue))
  }

  const handleInputChange = (index: 0 | 1) => (newValue: string | undefined) => {
    // Allow decimal points and commas
    if (typeof newValue === 'string' && /[.,]$/.test(newValue)) {
      return
    }
    const numericValue = Number(newValue)
    if (Number.isNaN(numericValue)) {
      return
    }

    if (isRange) {
      const nextFirst = index === 0 ? numericValue : currentFirst
      let nextSecond = index === 1 ? numericValue : currentSecond

      if (nextFirst > nextSecond) {
        // Left input (index === 0) should not be bigger than the right input value
        if (index === 0) nextSecond = nextFirst
        // For the right input it is allowed because when selecting "800" for example,
        // the user first types "8" which can be smaller than the first input.
        else return
      }

      onChange([nextFirst, nextSecond])
      return
    }

    onChange(numericValue)
  }

  const renderInput = (inputValue: number | undefined, index: 0 | 1) => (
    <NumericTextField
      aria-label={ariaLabel}
      size={sliderInputSizeMap[size]}
      variant="filled"
      value={toDecimal(inputValue)}
      min={toDecimal(min)}
      max={toDecimal(max)}
      onChange={handleInputChange(index)}
      disabled={disabled}
      sx={{ maxWidth: sliderInputMaxWidthMap[layoutDirection] }}
      data-testid={`slider-input-${testId}-${index}`}
      {...inputProps}
    />
  )

  const renderSlider = (
    <Slider
      aria-label={ariaLabel}
      size={size}
      value={sliderValue}
      onChange={handleSliderChange}
      min={sliderMinValue}
      max={sliderMaxValue}
      step={sliderStepValue}
      disabled={disabled}
      scale={mapFromSliderValue}
      data-testid={`slider-${testId}`}
      {...sliderProps}
    />
  )

  return (
    <Stack direction={layoutDirection} alignItems="center" columnGap={Spacing.sm} rowGap={Spacing.xs} width="100%">
      {layoutDirection === 'row' ? (
        <>
          {isRange && renderInput(currentFirst, 0)}
          {renderSlider}
          {renderInput(currentSecond, 1)}
        </>
      ) : (
        <>
          {renderSlider}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={isRange ? 'space-between' : 'flex-end'}
            columnGap={Spacing.sm}
            rowGap={Spacing.xs}
            width="100%"
          >
            {isRange && renderInput(currentFirst, 0)}
            {renderInput(currentSecond, 1)}
          </Stack>
        </>
      )}
    </Stack>
  )
}
