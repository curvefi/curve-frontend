import styled from 'styled-components'

import CrvStats from './components/CrvStats'
import VeCrvFees from './components/VeCrvFees'
import DailyLocks from './components/DailyLocks'
import TopLockers from './components/TopLockers'

const VeCrv = () => {
  return (
    <Wrapper>
      <PageTitle>veCRV</PageTitle>
      <Content>
        <CrvStats />
        <VeCrvFees />
        <Column>
          <TopLockers />
          <DailyLocks />
        </Column>
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  @media (min-width: 56.25rem) {
    flex-direction: row;
  }
`

export default VeCrv
