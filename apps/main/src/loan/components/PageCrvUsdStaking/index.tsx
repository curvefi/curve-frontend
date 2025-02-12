import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useStore from '@/loan/store/useStore'

import StatsBanner from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/loan/components/PageCrvUsdStaking/UserInformation'
import UserPosition from '@/loan/components/PageCrvUsdStaking/UserPosition'
import Statistics from '@/loan/components/PageCrvUsdStaking/Statistics'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Stack, useMediaQuery } from '@mui/material'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Fade from '@mui/material/Fade'

const { MaxWidth } = SizesAndSpaces

const CrvUsdStaking = () => {
  const [isChartExpanded = false, , minimizeChart, toggleChartExpanded] = useSwitch(false)
  const fetchUserBalances = useStore((state) => state.scrvusd.fetchUserBalances)
  const checkApproval = useStore((state) => state.scrvusd.checkApproval)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const fetchExchangeRate = useStore((state) => state.scrvusd.fetchExchangeRate)
  const fetchCrvUsdSupplies = useStore((state) => state.scrvusd.fetchCrvUsdSupplies)
  const stakingModule = useStore((state) => state.scrvusd.stakingModule)
  const lendApi = useStore((state) => state.lendApi)
  const { signerAddress, connecting, walletName } = useWallet()
  const chainId = useStore((state) => state.curve?.chainId)
  const userScrvUsd = useStore((state) => state.scrvusd.userBalances[signerAddress ?? '']) ?? '0'

  const userScrvUsdBalance = userScrvUsd?.scrvUSD ?? '0'

  const willConnect = connecting || walletName

  const isUserScrvUsdBalanceZero = BigNumber(userScrvUsdBalance).isZero()

  const showStatsBanner = !willConnect && isUserScrvUsdBalanceZero
  // show when wallet won't connect, if the userbalance fetch has completed and the balance is zero

  console.log(userScrvUsd)
  console.log(isUserScrvUsdBalanceZero)

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
  }, [fetchUserBalances, lendApi, signerAddress, fetchExchangeRate, fetchCrvUsdSupplies])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === '0') return

    if (stakingModule === 'deposit') {
      checkApproval.depositApprove(inputAmount)
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
        sx={{
          maxWidth: `calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section})`,
        }}
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
            [`@media (max-width: ${columnViewBreakPoint})`]: {
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            },
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
              sx={{
                [`@media (max-width: ${columnViewBreakPoint})`]: {
                  alignItems: 'center',
                },
              }}
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
      <UserInformation />
    </Stack>
  )
}

export default CrvUsdStaking
