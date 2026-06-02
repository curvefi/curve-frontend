import { ReactNode } from 'react'
import { styled } from 'styled-components'

type ItemCompProps = {
  $isDivider?: boolean
  $minWidth?: string
  $marginTop?: string
}

export const Item = ({ label, value, ...props }: ItemCompProps & { label: ReactNode; value: ReactNode }) => (
  <ItemComp {...props}>
    <span>{label}</span>
    <span>{value}</span>
  </ItemComp>
)

const ItemComp = styled.div<ItemCompProps>`
  align-items: baseline;
  display: grid;
  grid-template-columns: auto 1fr;

  span:last-of-type {
    min-width: ${({ $minWidth }) => $minWidth || '210px'};
    text-align: right;
  }

  ${({ $isDivider }) => {
    if ($isDivider) {
      return `
        border-top: 1px solid white;
        padding-top: var(--spacing-1);
      `
    }
  }}

  ${({ $marginTop }) => $marginTop && `margin-top: ${$marginTop};`};

  svg {
    position: relative;
    margin: 0 var(--spacing-1);
    top: 3px;
    width: 12px;
    opacity: 0.8;
  }
`
