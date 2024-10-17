import styled from 'styled-components'

import StatsBanner from '@/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/components/PageCrvUsdStaking/UserInformation'

const CrvUsdStaking = () => {
  return (
    <Wrapper>
      <StyledStatsBanner />
      <StyledDepositWithdraw />
      <UserInformation />
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

const StyledDepositWithdraw = styled(DepositWithdraw)`
  margin: 0 auto;
`

export default CrvUsdStaking
