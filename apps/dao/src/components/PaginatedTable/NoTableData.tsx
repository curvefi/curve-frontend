import styled from 'styled-components'

import Box from '@/ui/Box'
import ErrorMessage from '@/components/ErrorMessage'

type NoTableDataProps = {
  height: string
  noDataMessage: string
  refetchData: () => void
}

const NoTableData: React.FC<NoTableDataProps> = ({ height, noDataMessage, refetchData }) => (
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

export default NoTableData
