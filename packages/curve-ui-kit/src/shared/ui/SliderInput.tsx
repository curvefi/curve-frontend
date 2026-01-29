import { clamp, sortBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import { TextFieldProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useDebounce } from '@ui-kit/hooks/useDebounce'
import { SliderSize } from '@ui-kit/themes/components/slider/types'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { NumericTextField, NumericTextFieldProps } from './NumericTextField'
import { Slider, type SliderProps } from './Slider'

const { Spacing, MaxWidth } = SizesAndSpaces

export type RangeValue = [number, number]
export type DecimalRangeValue = [Decimal, Decimal]

export type SliderInputProps<T extends Decimal | DecimalRangeValue> = {
  /** The direction of the layout. Row: inputs on the left and right of the slider. Column: inputs below the slider. */
  layoutDirection?: 'column' | 'row'
  /** The size of the slider and inputs. Sizes of the inputs are calculated based on the size of the slider. */
  size?: SliderSize
  /** Value controlled by the slider and inputs. Pass an array to enable a range slider. */
  value: T
  /** Change handler shared between the slider and inputs. */
  onChange: (value: T) => void
  /** Minimum allowed value for both inputs and slider */
  min?: number
  /** Maximum allowed value for both inputs and slider */
  max?: number
  /** Step increment for the slider */
  step?: number
  /** Propagated to both inputs and slider */
  disabled?: boolean
  /** The debounce time in milliseconds for the slider and inputs */
  debounceMs?: number
  /** Optional transform that maps values between the inputs and the slider */
  sliderValueTransform?: {
    toSlider: (value: number) => number
    fromSlider: (value: number) => number
    sliderMin?: number
    sliderMax?: number
    sliderStep?: number | null
  }
  /** ID for the slider and inputs */
  id: string
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
const sliderInputMaxWidthMap: Record<NonNullable<SliderInputProps<Decimal>['layoutDirection']>, string> = {
  row: MaxWidth.sliderInput.sm,
  column: MaxWidth.sliderInput.md,
}

/**
 * Applies a function to either a single value or to both values of a tuple, preserving the shape.
 */
const apply = <T, R>(value: T | [T, T], fn: (v: T) => R): R | [R, R] =>
  Array.isArray(value) ? [fn(value[0]), fn(value[1])] : fn(value)

/** Clamps a Decimal or Decimal range between min and max bounds */
const clampDecimal = <T extends Decimal | DecimalRangeValue>(
  value: Decimal | DecimalRangeValue,
  min: number,
  max: number,
): T => apply(value, (v) => decimal(clamp(Number(v), min, max))) as T

const isRangeValue = (value: Decimal | DecimalRangeValue): value is DecimalRangeValue => Array.isArray(value)

/**
 * A controlled slider component with synchronized numeric input fields.
 * With multiple inputs and layout orientations
 * Supports both single value and range modes. User interactions are debounced
 * during drag and typing, then immediately committed on blur or release.
 */
export const SliderInput = <T extends Decimal | DecimalRangeValue>({
  layoutDirection = 'row',
  size = 'medium',
  value,
  onChange,
  min = 0,
  max = Infinity,
  step,
  disabled,
  sliderProps,
  inputProps,
  sliderValueTransform,
  id,
  debounceMs = Duration.FormDebounce,
}: SliderInputProps<T>) => {
  const isRange = isRangeValue(value)
  type SliderValue = T extends Decimal ? number : RangeValue
  const sliderMinValue = sliderValueTransform?.sliderMin ?? min
  const sliderMaxValue = sliderValueTransform?.sliderMax ?? max
  const sliderStepValue = sliderValueTransform?.sliderStep ?? step

  /** Translate a value into the slider space expected by MUI Slider. */
  const mapToSliderValue = useMemo(
    () => sliderValueTransform?.toSlider ?? ((sliderValue: number) => sliderValue),
    [sliderValueTransform?.toSlider],
  )
  /** Transform slider values back into the original value space used by the inputs. */
  const mapFromSliderValue = useMemo(
    () => sliderValueTransform?.fromSlider ?? ((sliderValue: number) => sliderValue),
    [sliderValueTransform?.fromSlider],
  )

  /** Internal debounced value state for slider and inputs during drag and typing */
  const [internalValue, setInternalValue, cancelDebounce] = useDebounce<T>(
    value,
    debounceMs,
    useCallback((nextValue) => onChange(clampDecimal(nextValue, min, max)), [onChange, min, max]),
  )

  /** The current display values for slider and inputs */
  const displayValue = useMemo((): T => internalValue ?? value, [internalValue, value])

  /** The slider's numeric value with sliderValueTransform mapping if provided (e.g. logarithmic scales) */
  const sliderValue = useMemo(
    (): SliderValue => apply(displayValue, (v) => mapToSliderValue(Number(v))) as SliderValue,
    [displayValue, mapToSliderValue],
  )

  /** Commits value without debouncing for slider and inputs on slider release and input blur */
  const commitValue = useCallback(
    (nextValue: T | undefined) => {
      if (nextValue == null) return
      setInternalValue(nextValue)
      cancelDebounce()
      if (Array.isArray(nextValue) && nextValue.find((v) => v == null)) return
      onChange(nextValue as T)
    },
    [cancelDebounce, onChange, setInternalValue],
  )

  /**Converts slider's numeric value to Decimal and maps back to original value space */
  const computeSliderValue = useCallback(
    (rawValue: SliderValue): T | undefined => {
      const mapped = apply(rawValue, (v) => decimal(mapFromSliderValue(v)))
      return Array.isArray(mapped) && mapped.find((v) => v == null) ? undefined : (mapped as T)
    },
    [mapFromSliderValue],
  )

  const handleSliderChange = useCallback<NonNullable<SliderProps['onChange']>>(
    (_e, newValue) => {
      const next = computeSliderValue(newValue as SliderValue)
      if (next != null) {
        setInternalValue(next)
      }
    },
    [computeSliderValue, setInternalValue],
  )

  const handleSliderCommit = useCallback<NonNullable<SliderProps['onChangeCommitted']>>(
    (_e, newValue) => {
      const next = computeSliderValue(newValue as SliderValue)
      if (next != null) {
        commitValue(next)
      }
    },
    [commitValue, computeSliderValue],
  )

  const handleInputChange = useCallback(
    (index: number) => (newValue: string | undefined) => {
      const numericValue = Number(newValue)
      if (isRange) {
        const currentRange = displayValue as DecimalRangeValue
        const nextFirst = index === 0 ? numericValue : Number(currentRange[0])
        let nextSecond = index === 1 ? numericValue : Number(currentRange[1])
        if (nextFirst > nextSecond) {
          // Left input (index === 0) should not be bigger than the right input value
          if (index === 0) nextSecond = nextFirst
          // For the right input it is allowed because when selecting "800" for example,
          // the user first types "8" which can be smaller than the first input.
          else return
        }
        setInternalValue([decimal(nextFirst), decimal(nextSecond)] as T)
        return
      }
      setInternalValue(decimal(numericValue) as T)
    },
    [displayValue, isRange, setInternalValue],
  )

  const handleInputBlur = useCallback(
    (index: number) => (blurValue: Decimal | undefined) => {
      if (blurValue == null) return
      commitValue(
        (isRange
          ? sortBy([...(displayValue as DecimalRangeValue).filter((_, i) => i !== index), blurValue])
          : blurValue) as T,
      )
    },
    [commitValue, displayValue, isRange],
  )

  const { onBlur: inputOnBlur, ...restInputProps } = inputProps ?? {}
  const { onChangeCommitted: sliderOnChangeCommitted, ...restSliderProps } = sliderProps ?? {}

  /** First input's value */
  const currentFirst = isRange ? (displayValue as DecimalRangeValue)?.[0] : (displayValue as Decimal | undefined)
  /** Second input's value */
  const currentSecond = isRange ? (displayValue as DecimalRangeValue)?.[1] : (displayValue as Decimal | undefined)

  const renderInput = (inputValue: Decimal | undefined, index: 0 | 1) => (
    <NumericTextField
      size={sliderInputSizeMap[size]}
      variant="standard"
      value={inputValue}
      min={decimal(min)}
      max={decimal(max)}
      onChange={(newValue) => {
        handleInputChange(index)(newValue)
      }}
      onBlur={(newValue) => {
        handleInputBlur(index)(newValue)
        inputOnBlur?.(newValue)
      }}
      disabled={disabled}
      sx={{ maxWidth: sliderInputMaxWidthMap[layoutDirection] }}
      data-testid={`slider-input-${id}-${index === 0 ? 'min' : 'max'}`}
      {...restInputProps}
    />
  )

  const renderSlider = (
    <Slider
      size={size}
      value={sliderValue}
      onChange={handleSliderChange}
      onChangeCommitted={(event, newValue) => {
        handleSliderCommit(event, newValue)
        sliderOnChangeCommitted?.(event, newValue)
      }}
      min={sliderMinValue}
      max={sliderMaxValue}
      step={sliderStepValue}
      disabled={disabled}
      scale={mapFromSliderValue}
      data-testid={`slider-${id}`}
      {...restSliderProps}
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
