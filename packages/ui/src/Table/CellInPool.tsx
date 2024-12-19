import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils'

import Chip from 'ui/src/Typography/Chip'
import Icon from 'ui/src/Icon'

type Props = {
  as?: keyof JSX.IntrinsicElements
  isIn?: boolean
  isMobile?: boolean
  type: 'pool' | 'market'
  tooltip: string
}

const CellInPool = ({ isIn, isMobile, type, tooltip, ...rest }: Props) => (
  <Td {...rest} $isIn={isIn} $isMobile={isMobile} className={isIn ? 'active' : ''}>
    {isIn && (
      <Chip tooltip={tooltip} tooltipProps={{ placement: 'top left' }}>
        <StyledIcon name="CurrencyDollar" size={16} />
      </Chip>
    )}
  </Td>
)

const Td = styled.td<{ $isIn?: boolean; $isMobile?: boolean }>`
  ${({ $isIn }) => {
    if ($isIn) {
      return `
        color: var(--box--primary--color);
        background-color: var(--table_detail_row--active--background-color);
      `
    }
  }};

  ${({ $isMobile }) => {
    if ($isMobile) {
      return `
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 21px;
      `
    }
  }};

  @media (min-width: ${breakpoints.sm}rem) {
    border-bottom: none;
  }
`

const StyledIcon = styled(Icon)`
  width: 21px;
`

export default CellInPool
