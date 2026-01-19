import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Icon } from '@ui/Icon'
import type { RouteDetailsProps } from '../types'
import type { BreakdownItem } from '../types'
import { format } from '../utils'

export const ExpectedSummary = ({
  label,
  swapFromAmounts,
  swapToAmounts,
  swapFromSymbol,
  swapToSymbol,
  nonSwapAmount,
  total,
  $minWidth,
}: Pick<RouteDetailsProps, 'swapFromAmounts' | 'swapToAmounts' | 'nonSwapAmount' | 'total' | '$minWidth'> & {
  label: ReactNode
  swapFromSymbol: string
  swapToSymbol: string
}) => (
  <Wrapper>
    {label}
    {swapToAmounts.map((amount, idx) => {
      const { value, label } = swapFromAmounts[idx]

      return (
        <Item key={`${amount}${idx}`} {...($minWidth ? { $minWidth } : {})}>
          <span>{label}</span>{' '}
          <span>
            {format(value, { defaultValue: '-' })} {swapFromSymbol} <Icon name="ArrowRight" size={16} />{' '}
            {format(amount, { defaultValue: '-' })} {swapToSymbol}
          </span>
        </Item>
      )
    })}
    <Item>
      <span>{nonSwapAmount.label}</span>
      <span>
        {format(nonSwapAmount.value, { defaultValue: '-' })} {swapToSymbol}
      </span>
    </Item>
    <Item $isTotal>
      {format(total, { defaultValue: '-' })} {swapToSymbol}
    </Item>
  </Wrapper>
)

const Wrapper = styled.section`
  border-bottom: 1px solid var(--button_outlined--border-color);
  display: grid;
  grid-gap: 1px;
  padding: var(--spacing-3);
`

const Item = styled.div<BreakdownItem>`
  align-items: baseline;
  display: flex;
  font-size: var(--font-size-2);
  font-weight: bold;
  justify-content: flex-end;
  text-align: right;

  > span:first-of-type {
    white-space: nowrap;
  }

  > span:last-of-type {
    min-width: ${({ $minWidth }) => $minWidth || '180px'};
  }

  ${({ $opacity }) => $opacity && `opacity: 0.6;`};

  ${({ $isTotal }) => {
    if ($isTotal) {
      return `
        border-top: 1px solid var(--border-400);
        padding-top: var(--spacing-1);
      `
    }
  }};

  svg {
    position: relative;
    top: 3px;
    opacity: 0.6;
  }
`
