import type { NumberFormatOptions } from '@internationalized/number'
import type { AriaSliderProps } from 'react-aria'
import type { SliderState } from 'react-stately'
import { mergeProps, useFocusRing, useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden } from 'react-aria'
import { useSliderState } from 'react-stately'
import styled from 'styled-components'
import Spinner from 'ui/src/Spinner/Spinner'
import SpinnerWrapper from 'ui/src/Spinner/SpinnerWrapper'
import { RefObject, useRef } from 'react'

interface Props extends AriaSliderProps {
  formatOptions: NumberFormatOptions
  hideValue?: boolean
  hideLabel?: boolean
  loading?: boolean
}

function SliderSingleThumb({ loading, hideValue, hideLabel, ...props }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const numberFormatter = useNumberFormatter(props.formatOptions)
  const state = useSliderState({ ...props, numberFormatter })
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(props, state, trackRef)
  const isDisplayOnly = typeof props.onChange === 'undefined' && typeof props.onChangeEnd === 'undefined'

  return (
    <SliderWrapper {...groupProps} className={state.orientation}>
      {/* Create a container for the label and output element. */}
      {props.label && (
        <SliderLabelContainer className={hideLabel && hideValue ? 'visually-hidden' : ''}>
          <Label className={hideLabel ? 'visually-hidden' : ''} {...labelProps}>
            {props.label}
          </Label>
          <output className={hideValue ? 'visually-hidden' : ''} {...outputProps}>
            {!loading && state.getThumbValueLabel(0)}
          </output>
        </SliderLabelContainer>
      )}
      {/* The track element holds the visible track line and the thumb. */}
      <SliderContentWrapper>
        {loading && (
          <StyledSpinnerWrapper vSpacing={1}>
            <Spinner size={20} />
          </StyledSpinnerWrapper>
        )}
        <SliderTrackerWrapper className={loading ? 'loading' : ''}>
          <SliderTrack
            {...trackProps}
            ref={trackRef}
            className={`track ${state.isDisabled || loading || isDisplayOnly ? 'disabled' : ''} ${
              isDisplayOnly ? 'isDisplayOnly' : ''
            } `}
          >
            <Thumb index={0} state={state} trackRef={trackRef} />
          </SliderTrack>
        </SliderTrackerWrapper>
      </SliderContentWrapper>
    </SliderWrapper>
  )
}

function Thumb(props: { index: number; state: SliderState; trackRef: RefObject<HTMLDivElement | null> }) {
  const { state, trackRef, index } = props
  const inputRef = useRef(null)
  const { thumbProps, inputProps, isDragging } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
    },
    state,
  )

  const { focusProps, isFocusVisible } = useFocusRing()
  return (
    <ThumbWrapper {...thumbProps} className={`thumb ${isFocusVisible ? 'focus' : ''} ${isDragging ? 'dragging' : ''}`}>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </ThumbWrapper>
  )
}

const Label = styled.label`
  font-size: var(--font-size-2);
`

const ThumbWrapper = styled.div`
  width: 20px;
  height: 20px;
  background: var(--button--background-color);
  box-shadow: 1px 1px 0 var(--button--shadow-color);

  .dragging {
    background: dimgray;
    box-shadow: none;
  }

  .focus {
    background: orange;
  }

  &:active {
    box-shadow: none;
  }

  &:not(.disabled) {
    cursor: pointer;
  }

  &.disabled {
    background: var(--button--disabled--background-color);
    box-shadow: none;
  }
`

const SliderTrack = styled.div`
  &:before {
    content: attr(x);
    display: block;
    position: absolute;
    background: var(--switch--background-color);
    box-shadow: inset 1px 1px 2px var(--switch--box-shadow);
  }

  .disabled {
    opacity: 0.4;
  }
`

const SliderTrackerWrapper = styled.div`
  padding: 0 0.7rem;

  &.loading {
    opacity: 0.7;
  }
`

const SliderContentWrapper = styled.div`
  position: relative;
  min-height: 3.125rem; //50px
`

const SliderWrapper = styled.div`
  display: flex;

  &.horizontal {
    flex-direction: column;
    width: 100%;

    ${SliderTrack} {
      height: 30px;
      width: 100%;

      &:before {
        height: 8px;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    ${ThumbWrapper} {
      top: 50%;
    }
  }
`

const SliderLabelContainer = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  justify-content: space-between;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  position: absolute;
`

export default SliderSingleThumb
