import styled from 'styled-components'

const Tr = styled.tr`
  min-height: 3.75rem;
  cursor: pointer;

  + tr:not(.searchTermsResult) {
    border-top: 1px solid var(--border-400);
  }

  &:not(.searchTermsResult):hover {
    background-color: var(--table_row--hover--color);
    + tr.searchTermsResult {
      background-color: var(--table_row--hover--color);
    }
  }
`

export default Tr
