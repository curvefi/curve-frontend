import { BigNumber } from 'bignumber.js'
import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { DepositWithdraw } from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import { Statistics } from '@/loan/components/PageCrvUsdStaking/Statistics'
import { StatsBanner } from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import { UserInformation } from '@/loan/components/PageCrvUsdStaking/UserInformation'
import { UserPosition } from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { useStore } from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { Stack, useMediaQuery } from '@mui/material'
import Fade from '@mui/material/Fade'
import { type LlamaApi, useCurve } from '@ui-kit/features/connect-wallet'
import { useScrvUsdNewForms } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

function useLegacyFetching({
  lendApi,
  address,
  refetchUserScrvUsdBalance,
}: {
  lendApi: LlamaApi | null
  address: string | undefined
  refetchUserScrvUsdBalance: () => Promise<unknown>
}) {
  const enabled = !useScrvUsdNewForms() || true
  const checkApproval = useStore(state => state.scrvusd.checkApproval)
  const inputAmount = useStore(state => state.scrvusd.inputAmount)
  const fetchExchangeRate = useStore(state => state.scrvusd.fetchExchangeRate)
  const fetchCrvUsdSupplies = useStore(state => state.scrvusd.fetchCrvUsdSupplies)
  const stakingModule = useStore(state => state.scrvusd.stakingModule)
  const chainId = lendApi?.chainId

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
    const fetchData = async () => {
      if (!enabled || !lendApi || !address) return
      // ensure user balances are up to date on load
      void refetchUserScrvUsdBalance()
      fetchExchangeRate()
      fetchCrvUsdSupplies()
    }

    void fetchData()
  }, [enabled, lendApi, fetchExchangeRate, fetchCrvUsdSupplies, refetchUserScrvUsdBalance, address])

  useEffect(() => {
    if (enabled && lendApi && chainId && address && +inputAmount && stakingModule === 'deposit') {
      void checkApproval.depositApprove(inputAmount)
    }
  }, [enabled, checkApproval, lendApi, chainId, inputAmount, stakingModule, address])
}

export const CrvUsdStaking = ({ params }: { params: NetworkUrlParams }) => {
  const [isChartExpanded = false, , minimizeChart, toggleChartExpanded] = useSwitch(false)
  const { llamaApi: lendApi = null } = useCurve()
  const { address, isConnecting } = useConnection()

  const {
    data: userScrvUsdBalance,
    isFetching: isUserScrvUsdBalanceFetching,
    isFetched: isUserScrvUsdBalanceFetched,
    refetch: refetchUserScrvUsdBalance,
  } = useScrvUsdUserBalances({ userAddress: address })

  useLegacyFetching({ lendApi, address, refetchUserScrvUsdBalance })

  const isUserScrvUsdBalanceZero = !address || !userScrvUsdBalance || BigNumber(userScrvUsdBalance.scrvUSD).isZero()

  const connectedUserNoScrvUsdBalance = [address, isUserScrvUsdBalanceFetched, isUserScrvUsdBalanceZero].every(Boolean)

  const showStatsBanner =
    connectedUserNoScrvUsdBalance ||
    !address ||
    (!isConnecting && !isUserScrvUsdBalanceFetching && isUserScrvUsdBalanceZero)

  const columnViewBreakPoint = '65.625rem'
  const columnView = useMediaQuery(`(max-width: ${columnViewBreakPoint})`)

  // automatically minimize chart on smaller screens where the toggle button is hidden (the chart is already full width)
  useEffect(() => {
    if (columnView && isChartExpanded) minimizeChart()
  }, [isChartExpanded, columnView, minimizeChart])

  return (
    <Stack
      direction={'column'}
      sx={{
        alignItems: 'center',
        gap: Sizing[400],
        width: '100%',

        [`@media (max-width: calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section} + ${Sizing[400]}))`]:
          {
            padding: `0 ${Sizing[100]}`,
          },
      }}
    >
      <Stack
        direction={'column'}
        sx={{
          gap: Sizing[200],
          width: '100%',
          justifyContent: 'center',
          maxWidth: `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`,
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
          direction={isChartExpanded ? 'column' : 'row'}
          sx={{
            justifyContent: 'center',
            gap: Sizing[200],
            [`@media (max-width: ${columnViewBreakPoint})`]: { flexDirection: 'column', alignItems: 'center', gap: 0 },
          }}
        >
          {isChartExpanded && (
            <>
              {!isUserScrvUsdBalanceZero && <UserPosition />}
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
              sx={{
                gap: Sizing[200],
                width: '100%',
                maxWidth: MaxWidth.section,
                justifyContent: 'center',
                [`@media (max-width: ${columnViewBreakPoint})`]: { alignItems: 'center' },
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
      <UserInformation params={params} />
    </Stack>
  )
}
