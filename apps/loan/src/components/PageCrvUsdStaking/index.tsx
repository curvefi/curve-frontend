import styled from 'styled-components'

import StatsBanner from '@/components/PageCrvUsdStaking/StatsBanner'
import FormDeposit from '@/components/PageCrvUsdStaking/FormDeposit'

const CrvUsdStaking = () => {
  return (
    <Wrapper>
      <StyledStatsBanner />
      <FormDeposit />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-4);
`

const StyledStatsBanner = styled(StatsBanner)``

export default CrvUsdStaking
