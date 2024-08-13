import styled from 'styled-components'

import { Tab } from './Tab'

const Tabs = styled.div`
  display: flex;
  flex-wrap: nowrap;

  > ${Tab}.active {
    &:not(:first-of-type) {
      border-left: 3px solid var(--tab--border-color);
    }
    border-right: 3px solid var(--tab--border-color);
  }
`

export default Tabs
