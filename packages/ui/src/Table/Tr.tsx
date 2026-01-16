import { styled } from 'styled-components'

export const Tr = styled.tr`
  cursor: pointer;

  &.pending {
    height: 3.4375rem; // 55px
  }

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
