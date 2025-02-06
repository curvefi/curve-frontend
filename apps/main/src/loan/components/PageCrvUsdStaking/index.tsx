import styled from 'styled-components'
import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useStore from '@/loan/store/useStore'

import StatsBanner from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/loan/components/PageCrvUsdStaking/UserInformation'
import UserPositionBanner from '@/loan/components/PageCrvUsdStaking/UserPositionBanner'
import Statistics from '@/loan/components/PageCrvUsdStaking/Statistics'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Stack, useMediaQuery } from '@mui/material'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

const CrvUsdStaking = ({ mobileBreakpoint }: { mobileBreakpoint: string }) => {
  const [isChartExpanded = false, , minimizeChart, toggleChartExpanded] = useSwitch(false)
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
  const { signerAddress, provider } = useWallet()
  const chainId = useStore((state) => state.curve?.chainId)
  const userScrvUsdBalance = useStore((state) => state.scrvusd.userBalances[signerAddress ?? '']?.scrvUSD) ?? '0'
  const isUserScrvUsdBalanceZero = BigNumber(userScrvUsdBalance).isZero()
  const columnViewBreakPoint = '65.625rem'
  const columnView = useMediaQuery(`(max-width: ${columnViewBreakPoint})`)

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
    fetchSavingsYield(provider)
  }, [fetchSavingsYield, provider])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      checkApproval.depositApprove(inputAmount)
    }
  }, [checkApproval, lendApi, chainId, signerAddress, inputAmount, stakingModule])

  // close chart on mobile
  useEffect(() => {
    if (columnView && isChartExpanded) {
      minimizeChart()
    }
  }, [isChartExpanded, columnView, minimizeChart])

  return (
    <Wrapper>
      <MainContainer isChartExpanded={isChartExpanded} mobileBreakpoint={mobileBreakpoint}>
        {isUserScrvUsdBalanceZero && <StatsBanner />}
        <Stack
          width="100%"
          justifyContent="center"
          direction={isChartExpanded ? 'column' : 'row'}
          gap={Sizing[200]}
          sx={{
            [`@media (max-width: ${columnViewBreakPoint})`]: {
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            },
          }}
        >
          {isChartExpanded && (
            <>
              {!isUserScrvUsdBalanceZero && (
                <UserPositionBanner mobileBreakpoint={mobileBreakpoint} chartExpanded={isChartExpanded} />
              )}
              <Statistics
                hideExpandChart={columnView}
                isChartExpanded={isChartExpanded}
                toggleChartExpanded={toggleChartExpanded}
              />
            </>
          )}
          <DepositWithdraw />
          {!isChartExpanded && (
            <Stack
              gap={Sizing[100]}
              width="100%"
              maxWidth={MaxWidth.section}
              justifyContent="center"
              sx={{
                [`@media (max-width: ${columnViewBreakPoint})`]: {
                  alignItems: 'center',
                },
              }}
            >
              {!isUserScrvUsdBalanceZero && (
                <UserPositionBanner mobileBreakpoint={mobileBreakpoint} chartExpanded={isChartExpanded} />
              )}
              <Statistics
                hideExpandChart={columnView}
                isChartExpanded={isChartExpanded}
                toggleChartExpanded={toggleChartExpanded}
              />
            </Stack>
          )}
        </Stack>
      </MainContainer>
      <UserInformation />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  padding: 0 var(--spacing-2);
  gap: var(--spacing-4);
  @media (min-width: calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section + Sizing[400]})) {
    padding: 0;
  }
`

const MainContainer = styled.div<{ mobileBreakpoint: string; isChartExpanded: boolean }>`
  display: flex;
  flex-direction: ${({ isChartExpanded }) => (isChartExpanded ? 'column' : 'row')};
  gap: var(--spacing-3);
  padding: ${({ isChartExpanded }) => (isChartExpanded ? 'var(--spacing-3)' : '0')};
  flex-direction: column;
`

export default CrvUsdStaking
