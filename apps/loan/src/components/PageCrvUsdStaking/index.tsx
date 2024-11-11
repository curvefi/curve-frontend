import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/store/useStore'

import StatsBanner from '@/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/components/PageCrvUsdStaking/UserInformation'

const CrvUsdStaking = () => {
  const {
    fetchUserBalances,
    checkApproval,
    inputAmount,
    fetchExchangeRate,
    fetchCrvUsdSupplies,
    fetchSavingsYield,
    stakingModule,
  } = useStore((state) => state.scrvusd)
  const lendApi = useStore((state) => state.lendApi)
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  const chainId = useStore((state) => state.curve?.chainId)

  useEffect(() => {
    const fetchData = async () => {
      if (!lendApi || !signerAddress) return

      fetchUserBalances()
      fetchExchangeRate()
      fetchCrvUsdSupplies()
      fetchSavingsYield()
    }

    fetchData()
  }, [fetchUserBalances, lendApi, signerAddress, fetchExchangeRate, fetchCrvUsdSupplies, fetchSavingsYield])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      checkApproval.depositApprove(inputAmount)
    }
  }, [checkApproval, lendApi, chainId, signerAddress, inputAmount, stakingModule])

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
  padding: 0 var(--spacing-2);
  gap: var(--spacing-4);
  @media (min-width: 29.375rem) {
    padding: 0 var(--spacing-3);
  }
  @media (min-width: 43.75rem) {
    padding: 0 var(--spacing-4);
  }
  // 79.5rem === var(--width)
  @media (min-width: 79.5rem) {
    padding: 0;
  }
`

const StyledStatsBanner = styled(StatsBanner)``

const StyledDepositWithdraw = styled(DepositWithdraw)`
  margin: var(--spacing-3) auto;
`

export default CrvUsdStaking
