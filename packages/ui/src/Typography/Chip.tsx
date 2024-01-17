import type { ChipProps } from 'ui/src/Typography/types'

import * as React from 'react'
import styled from 'styled-components'

import Tooltip from 'ui/src/Tooltip/TooltipButton'

const Chip = (props: React.PropsWithChildren<ChipProps>) => {
  const { children, className, tooltip, tooltipProps, ...rest } = props
  const ref = React.useRef<HTMLDivElement>(null)

  const LabelComp = () => {
    return (
      <Label {...rest} className={className} ref={ref}>
        {children}
      </Label>
    )
  }

  if (tooltip) {
    return (
      <Tooltip tooltip={tooltip} {...tooltipProps}>
        <LabelComp />
      </Tooltip>
    )
  }

  return <LabelComp />
}

Chip.defaultProps = {
  className: '',
  tooltipProps: {},
}

interface LabelProps
  extends Pick<ChipProps, 'isBold' | 'isError' | 'isMono' | 'fontVariantNumeric' | 'opacity' | 'size' | 'maxWidth'> {}

const Label = styled.span<LabelProps>`
  ${({ isBold }) => {
    if (isBold) {
      return `font-weight: var(--font-weight--bold);`
    }
  }}

  ${({ fontVariantNumeric }) => {
    if (fontVariantNumeric) return `font-variant-numeric: ${fontVariantNumeric};`
  }}
  
  ${({ isMono }) => {
    if (isMono) {
      return 'font-family: var(--font-mono);'
    }
  }}

  ${({ isError }) => {
    if (isError) {
      return `color: var(--danger_darkBg-400);`
    }
  }}
  ${({ opacity }) => {
    if (typeof opacity !== 'undefined') {
      return `opacity: ${opacity};`
    }
  }}
  
    // TODO: remove
  ${({ maxWidth }) => {
    if (maxWidth) {
      return `
        display: inline-block;
        ${maxWidth && `max-width: ${maxWidth};`}
        overflow: hidden;
        cursor: pointer;

        text-overflow: ellipsis;
        white-space: nowrap;
      `
    }
  }}

  ${({ size }) => {
    if (size === 'xs') {
      return `font-size: var(--font-size-1);`
    } else if (size === 'sm') {
      return `font-size: var(--font-size-2);`
    } else if (size === 'md') {
      return `font-size: var(--font-size-3);`
    } else if (size === 'lg') {
      return 'font-size: var(--font-size-4);'
    }
  }}
  
  .svg-tooltip {
    opacity: 0.7;
    position: relative;
    top: 3px;

    :hover {
      opacity: 1;
    }
  }
`

Label.defaultProps = {
  size: 'sm',
}

export default Chip
