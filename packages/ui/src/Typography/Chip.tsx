import { PropsWithChildren } from 'react'
import { styled } from 'styled-components'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { TooltipButton as Tooltip } from 'ui/src/Tooltip/TooltipButton'
import type { ChipProps } from 'ui/src/Typography/types'

export const Chip = ({
  as,
  children,
  className,
  tooltip,
  tooltipProps,
  ...rest
}: PropsWithChildren<ChipProps & { as?: string }>) => (
  <WithWrapper shouldWrap={tooltip} Wrapper={Tooltip} as={as} tooltip={tooltip} {...tooltipProps}>
    <Label {...rest} {...(tooltip && { as })} className={className}>
      {children}
    </Label>
  </WithWrapper>
)

const Label = styled.span<
  Pick<ChipProps, 'isBold' | 'isError' | 'isMono' | 'fontVariantNumeric' | 'opacity' | 'size' | 'maxWidth'>
>`
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
