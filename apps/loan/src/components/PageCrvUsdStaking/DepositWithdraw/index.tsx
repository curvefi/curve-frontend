import { SubNavItem } from '@/components/PageCrvUsdStaking/components/SubNav/types'
import { DepositWithdrawModule } from '@/components/PageCrvUsdStaking/types'
import { useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { SUB_NAV_ITEMS } from '@/components/PageCrvUsdStaking/DepositWithdraw/constants'

import SubNav from '@/components/PageCrvUsdStaking/components/SubNav'
import TransactionDetails from '@/components/PageCrvUsdStaking/TransactionDetails'
import DepositModule from '@/components/PageCrvUsdStaking/DepositWithdraw/DepositModule'
import WithdrawModule from '@/components/PageCrvUsdStaking/DepositWithdraw/WithdrawModule'
import DeployButton from '@/components/PageCrvUsdStaking/DepositWithdraw/DeployButton'

type DepositWithdrawProps = {
  className?: string
}

const DepositWithdraw = ({ className }: DepositWithdrawProps) => {
  const { module, setModule } = useStore((state) => state.scrvusd)

  const setNavChange = (key: SubNavItem['key']) => {
    setModule(key as DepositWithdrawModule)
  }

  return (
    <Wrapper className={className}>
      <SubNav activeKey={module} navItems={SUB_NAV_ITEMS} setNavChange={setNavChange} />
      <ModuleContainer>
        {module === 'deposit' ? <DepositModule /> : <WithdrawModule />}
        <StyledDeployButton />
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

const StyledDeployButton = styled(DeployButton)`
  margin: var(--spacing-3) 0 0;
`

export default DepositWithdraw
