import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { Box } from '@ui/Box'

type NoTableDataProps = {
  height: string
  noDataMessage: string
  refetchData: () => void
}

export const NoTableData = ({ height, noDataMessage, refetchData }: NoTableDataProps) => (
  <Wrapper height={height}>
    <ErrorMessage message={noDataMessage} onClick={refetchData} />
  </Wrapper>
)

const Wrapper = styled(Box)<{ height: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${({ height }) => height};
  padding-top: var(--spacing-4);
  width: 100%;
  p {
    font-size: var(--font-size-2);
    line-height: 1.5;
  }
`
