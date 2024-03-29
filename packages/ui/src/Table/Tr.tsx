import styled from 'styled-components'

const Tr = styled.tr`
  min-height: 3.75rem;
  cursor: pointer;

  &:hover {
    background-color: var(--table_row--hover--color);
  }
`

export default Tr
