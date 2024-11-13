import styled from 'styled-components'
import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useStore from '@/store/useStore'

import StatsBanner from '@/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/components/PageCrvUsdStaking/UserInformation'
import UserPositionBanner from '@/components/PageCrvUsdStaking/UserPositionBanner'

const CrvUsdStaking = ({ mobileBreakpoint } : {mobileBreakpoint: string }) => {
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
  const userScrvUsdBalance = useStore((state) => state.scrvusd.userBalances[signerAddress ?? '']?.scrvUSD) ?? '0'

  const isUserScrvUsdBalanceZero = BigNumber(userScrvUsdBalance).isZero()

  useEffect(() => {
    const fetchData = async () => {
      if (!lendApi || !signerAddress) return

      fetchUserBalances()
      fetchExchangeRate()
      fetchCrvUsdSupplies()
    }

    fetchData()
  }, [fetchUserBalances, lendApi, signerAddress, fetchExchangeRate, fetchCrvUsdSupplies, fetchSavingsYield])

  // none library fetches
  useEffect(() => {
    const fetchData = async () => {
      if (!signerAddress) return

      fetchSavingsYield()
    }

    fetchData()
  }, [fetchSavingsYield, signerAddress])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      checkApproval.depositApprove(inputAmount)
    }
  }, [checkApproval, lendApi, chainId, signerAddress, inputAmount, stakingModule])

  return (
    <Wrapper>
      <MainContainer mobileBreakpoint={mobileBreakpoint}>
        <StyledDepositWithdraw mobileBreakpoint={mobileBreakpoint} />
        {isUserScrvUsdBalanceZero ? <StyledStatsBanner mobileBreakpoint={mobileBreakpoint} /> : <StyledUserPositionBanner mobileBreakpoint={mobileBreakpoint} />}
      </MainContainer>
      <StyledUserInformation />
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

const MainContainer = styled.div<{ mobileBreakpoint: string }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: var(--spacing-3);
  @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
    flex-direction: column;
  }
`

const StyledStatsBanner = styled(StatsBanner)< {mobileBreakpoint: string }>`
    max-width: 309px;
    @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
        max-width: 100%;
    }
`

const StyledUserPositionBanner = styled(UserPositionBanner)<{ mobileBreakpoint: string }>`
  margin: var(--spacing-3) 0 auto var(--spacing-3);
  @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
    margin-left: 0;
    order: 1;
  }
`

const StyledDepositWithdraw = styled(DepositWithdraw)<{ mobileBreakpoint: string }>`
  @media (max-width: ${({ mobileBreakpoint }) => mobileBreakpoint}) {
    order: 2;
    margin: var(--spacing-3) auto auto;
  }
`

const StyledUserInformation = styled(UserInformation)`
  order: 3;
`

export default CrvUsdStaking
