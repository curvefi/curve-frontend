import styled from 'styled-components'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import { breakpoints } from '@ui/utils'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

const MarketListItemHeader = ({
  rChainId,
  idx,
  address,
  symbol,
}: {
  rChainId: ChainId
  idx: number
  address: string
  symbol: string
}) => (
  <TableTokenWrapper $isFirst={idx === 0}>
    <Wrapper flex flexAlignItems="center">
      {<StyledTokenIcon blockchainId={networks[rChainId].networkId} tooltip={symbol} address={address} />}
      <strong>{symbol}</strong>
    </Wrapper>
  </TableTokenWrapper>
)

const TableTokenWrapper = styled.div<{ $isFirst?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-1) var(--spacing-narrow);
  ${({ $isFirst }) => !$isFirst && `padding-top: var(--spacing-wide);`};

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
`

const Wrapper = styled(Box)`
  min-width: 100px;
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-1);
`

export default MarketListItemHeader
