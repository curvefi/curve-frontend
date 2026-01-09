import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { DepositWithdraw } from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import Statistics from '@/loan/components/PageCrvUsdStaking/Statistics'
import StatsBanner from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import UserInformation from '@/loan/components/PageCrvUsdStaking/UserInformation'
import UserPosition from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import useStore from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { Stack, useMediaQuery } from '@mui/material'
import Fade from '@mui/material/Fade'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

const CrvUsdStaking = ({ params }: { params: NetworkUrlParams }) => {
  const [isChartExpanded = false, , minimizeChart, toggleChartExpanded] = useSwitch(false)
  const checkApproval = useStore((state) => state.scrvusd.checkApproval)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const fetchExchangeRate = useStore((state) => state.scrvusd.fetchExchangeRate)
  const fetchCrvUsdSupplies = useStore((state) => state.scrvusd.fetchCrvUsdSupplies)
  const stakingModule = useStore((state) => state.scrvusd.stakingModule)
  const { llamaApi: lendApi = null } = useCurve()
  const chainId = lendApi?.chainId
  const { address, isConnecting } = useConnection()

  const {
    data: userScrvUsdBalance,
    isFetching: isUserScrvUsdBalanceFetching,
    isFetched: isUserScrvUsdBalanceFetched,
    refetch: refetchUserScrvUsdBalance,
  } = useScrvUsdUserBalances({ userAddress: address })

  const isUserScrvUsdBalanceZero = !address || !userScrvUsdBalance || BigNumber(userScrvUsdBalance.scrvUSD).isZero()

  const connectedUserNoScrvUsdBalance = [address, isUserScrvUsdBalanceFetched, isUserScrvUsdBalanceZero].every(Boolean)

  const showStatsBanner =
    connectedUserNoScrvUsdBalance ||
    !address ||
    (!isConnecting && !isUserScrvUsdBalanceFetching && isUserScrvUsdBalanceZero)

  const columnViewBreakPoint = '65.625rem'
  const columnView = useMediaQuery(`(max-width: ${columnViewBreakPoint})`)

  useEffect(() => {
    const fetchData = async () => {
      if (!lendApi || !address) return
      // ensure user balances are up to date on load
      void refetchUserScrvUsdBalance()
      fetchExchangeRate()
      fetchCrvUsdSupplies()
    }

    void fetchData()
  }, [lendApi, fetchExchangeRate, fetchCrvUsdSupplies, refetchUserScrvUsdBalance, address])

  useEffect(() => {
    if (!lendApi || !chainId || !address || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      void checkApproval.depositApprove(inputAmount)
    }
  }, [checkApproval, lendApi, chainId, inputAmount, stakingModule, address])

  // automatically minimize chart on smaller screens where the toggle button is hidden (the chart is already full width)
  useEffect(() => {
    if (columnView && isChartExpanded) {
      minimizeChart()
    }
  }, [isChartExpanded, columnView, minimizeChart])

  return (
    <Stack
      direction={'column'}
      alignItems={'center'}
      gap={Sizing[400]}
      width="100%"
      sx={{
        [`@media (max-width: calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section} + ${Sizing[400]}))`]:
          {
            padding: `0 ${Sizing[100]}`,
          },
      }}
    >
      <Stack
        direction={'column'}
        gap={Sizing[200]}
        width="100%"
        justifyContent={'center'}
        sx={{ maxWidth: `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})` }}
      >
        {showStatsBanner && (
          <Fade in={showStatsBanner}>
            <div>
              <StatsBanner />
            </div>
          </Fade>
        )}
        <Stack
          justifyContent="center"
          direction={isChartExpanded ? 'column' : 'row'}
          gap={Sizing[200]}
          sx={{
            [`@media (max-width: ${columnViewBreakPoint})`]: { flexDirection: 'column', alignItems: 'center', gap: 0 },
          }}
        >
          {isChartExpanded && (
            <>
              {!isUserScrvUsdBalanceZero && <UserPosition chartExpanded={isChartExpanded} />}
              <Statistics
                hideExpandChart={columnView}
                isChartExpanded={isChartExpanded}
                toggleChartExpanded={toggleChartExpanded}
              />
            </>
          )}
          <DepositWithdraw params={params} />
          {!isChartExpanded && (
            <Stack
              gap={Sizing[200]}
              width="100%"
              maxWidth={MaxWidth.section}
              justifyContent="center"
              sx={{ [`@media (max-width: ${columnViewBreakPoint})`]: { alignItems: 'center' } }}
            >
              {!isUserScrvUsdBalanceZero && <UserPosition />}
              <Statistics
                hideExpandChart={columnView}
                isChartExpanded={isChartExpanded}
                toggleChartExpanded={toggleChartExpanded}
              />
            </Stack>
          )}
        </Stack>
      </Stack>
      <UserInformation params={params} />
    </Stack>
  )
}

export default CrvUsdStaking
