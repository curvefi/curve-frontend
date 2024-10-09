import { SubNavItem } from '@/components/PageCrvUsdStaking/components/SubNav/types'

import { useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { SUB_NAV_ITEMS } from '@/components/PageCrvUsdStaking/DepositWithdraw/constants'

import Button from '@/ui/Button'

import SubNav from '@/components/PageCrvUsdStaking/components/SubNav'
import TransactionDetails from '@/components/PageCrvUsdStaking/TransactionDetails'
import DepositModule from '@/components/PageCrvUsdStaking/DepositWithdraw/DepositModule'
import WithdrawModule from '@/components/PageCrvUsdStaking/DepositWithdraw/WithdrawModule'
const DepositWithdraw = () => {
  const [activeKey, setActiveKey] = useState<SubNavItem['key']>('deposit')

  const setNavChange = (key: SubNavItem['key']) => {
    setActiveKey(key)
  }

  return (
    <Wrapper>
      <SubNav activeKey={activeKey} navItems={SUB_NAV_ITEMS} setNavChange={setNavChange} />
      <ModuleContainer>
        {activeKey === 'deposit' ? <DepositModule /> : <WithdrawModule />}
        <StyledButton variant="filled">{t`Deposit`}</StyledButton>
      </ModuleContainer>
      <TransactionDetailsWrapper>
        <TransactionDetails />
      </TransactionDetailsWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const ModuleContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--box--secondary--background-color);
  max-width: 27.5rem;
  padding: var(--spacing-3);
`

const TransactionDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 27.5rem;
  padding: var(--spacing-3);
  background-color: var(--page--background-color);
`

const StyledButton = styled(Button)`
  margin: var(--spacing-3) 0 0;
`

export default DepositWithdraw
