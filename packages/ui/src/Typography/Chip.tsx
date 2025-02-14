import type { ChipProps } from 'ui/src/Typography/types'

import * as React from 'react'
import styled from 'styled-components'
import Tooltip from 'ui/src/Tooltip/TooltipButton'

const Chip = ({ as, ...props }: React.PropsWithChildren<ChipProps & { as?: string }>) => {
  const { children, className, tooltip, tooltipProps, ...rest } = props
  const ref = React.useRef<HTMLDivElement>(null)

  const LabelComp = () => (
    <Label {...rest} {...(tooltip ? {} : { as })} className={className} ref={ref}>
      {children}
    </Label>
  )

  if (tooltip) {
    return (
      <Tooltip as={as} tooltip={tooltip} {...tooltipProps}>
        <LabelComp />
      </Tooltip>
    )
  }

  return <LabelComp />
}

interface LabelProps
  extends Pick<ChipProps, 'isBold' | 'isError' | 'isMono' | 'fontVariantNumeric' | 'opacity' | 'size' | 'maxWidth'> {}

const Label = styled.span<LabelProps>`
  ${({ isBold }) => isBold && `font-weight: var(--font-weight--bold);`}
  ${({ fontVariantNumeric }) => fontVariantNumeric && `font-variant-numeric: ${fontVariantNumeric};`}
  ${({ isMono }) => (isMono ? 'font-family: var(--font-mono);' : 'font-family: var(--font);')}
  ${({ isError }) => isError && `color: var(--danger_darkBg-400);`}
  ${({ opacity }) => opacity !== undefined && `opacity: ${opacity};`}
  
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

  ${({ size = 'sm' }) => {
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

    &:hover {
      opacity: 1;
    }
  }
`

export default Chip
