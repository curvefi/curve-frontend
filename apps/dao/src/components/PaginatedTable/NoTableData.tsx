import styled from 'styled-components'

import Box from '@/ui/Box'

type NoTableDataProps = {
  height: string
  noDataMessage: string
}

const NoTableData: React.FC<NoTableDataProps> = ({ height, noDataMessage }) => {
  return (
    <Wrapper height={height}>
      <p>{noDataMessage}</p>
    </Wrapper>
  )
}

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
