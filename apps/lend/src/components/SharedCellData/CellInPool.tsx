import styled from 'styled-components'

import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'
import Icon from '@/ui/Icon'

const CellInPool = ({ isInMarket }: { isInMarket: boolean }) => {
  return (
    <Wrapper isInMarket={isInMarket} flex flexAlignItems="center" flexJustifyContent="center" fillHeight>
      {isInMarket && (
        <Chip>
          <Icon name="CurrencyDollar" size={16} />
        </Chip>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)<{ isInMarket: boolean }>`
  color: var(--box--primary--color);
  ${({ isInMarket }) => isInMarket && `background-color: var(--table_detail_row--active--background-color);`}
`

export default CellInPool
