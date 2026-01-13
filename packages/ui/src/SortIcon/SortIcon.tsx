import { styled } from 'styled-components'
import { Icon } from '@ui/Icon/Icon'
import { breakpoints } from '@ui/utils/responsive'

type SortIconProps = {
  className?: string
  activeType: 'asc' | 'desc' | null
}

export const SortIcon = ({ className, activeType }: SortIconProps) => (
  <Wrapper className={className}>
    {activeType === 'asc' && <Icon name="ArrowUp" size={16} />}
    {activeType === 'desc' && <Icon name="ArrowDown" size={16} />}
  </Wrapper>
)

const Wrapper = styled.div`
  display: inline-block;
  margin: 0;
  min-height: 1rem;
  position: relative;
  top: 1px;

  font-size: 6px;
  line-height: 1;

  @media (max-width: ${breakpoints.sm}rem) {
    margin: 0 2px;
    top: 0;

    font-size: 7px;
  }
`
