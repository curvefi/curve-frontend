import styled from 'styled-components'

const Items = styled.ul<{ listItemMargin?: string }>`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin: ${({ listItemMargin }) => listItemMargin ?? 0};
  }
`

export default Items
