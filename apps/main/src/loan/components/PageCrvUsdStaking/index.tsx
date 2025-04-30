import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import DepositWithdraw from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import Statistics from '@/loan/components/PageCrvUsdStaking/Statistics'
import StatsBanner from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import UserInformation from '@/loan/components/PageCrvUsdStaking/UserInformation'
import UserPosition from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusdUserBalances'
import useStore from '@/loan/store/useStore'
import { useLendConnection, useStablecoinConnection } from '@/loan/temp-lib'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { Stack, useMediaQuery } from '@mui/material'
import Fade from '@mui/material/Fade'
import { useWallet } from '@ui-kit/features/connect-wallet'
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
  const { lib: lendApi = null } = useLendConnection()
  const chainId = useStablecoinConnection().lib?.chainId
  const { signerAddress, connecting, walletName } = useWallet()

  const {
    data: userScrvUsdBalance,
    isFetching: isUserScrvUsdBalanceFetching,
    isFetched: isUserScrvUsdBalanceFetched,
    refetch: refetchUserScrvUsdBalance,
  } = useScrvUsdUserBalances({ userAddress: signerAddress ?? '' })

  const isUserScrvUsdBalanceZero =
    !signerAddress || !userScrvUsdBalance || BigNumber(userScrvUsdBalance.scrvUSD).isZero()

  const connectedUserNoScrvUsdBalance = [
    signerAddress,
    walletName,
    isUserScrvUsdBalanceFetched,
    isUserScrvUsdBalanceZero,
  ].every(Boolean)

  // walletName indicates the wallet is cached and will begin connecting
  const showStatsBanner =
    !walletName ||
    connectedUserNoScrvUsdBalance ||
    !signerAddress ||
    (!connecting && !isUserScrvUsdBalanceFetching && isUserScrvUsdBalanceZero)

  const columnViewBreakPoint = '65.625rem'
  const columnView = useMediaQuery(`(max-width: ${columnViewBreakPoint})`)

  useEffect(() => {
    const fetchData = async () => {
      if (!lendApi || !signerAddress) return
      // ensure user balances are up to date on load
      void refetchUserScrvUsdBalance()
      fetchExchangeRate()
      fetchCrvUsdSupplies()
    }

    void fetchData()
  }, [lendApi, signerAddress, fetchExchangeRate, fetchCrvUsdSupplies, refetchUserScrvUsdBalance])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      void checkApproval.depositApprove(inputAmount)
    }
  }, [checkApproval, lendApi, chainId, signerAddress, inputAmount, stakingModule])

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
        [`@media (max-width: calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section} + ${Sizing[400]}))`]: {
          padding: `0 ${Sizing[100]}`,
        },
      }}
    >
      <Stack
        direction={'column'}
        gap={Sizing[200]}
        width="100%"
        justifyContent={'center'}
        sx={{ maxWidth: `calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section})` }}
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
          <DepositWithdraw />
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
