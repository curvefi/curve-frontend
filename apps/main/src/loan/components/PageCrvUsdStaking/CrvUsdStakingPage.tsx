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
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Box } from '@ui/Box'
import { RCScrvUSDLogoSM } from '@ui/images'
import { type LlamaApi, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useScrvUsdNewForms } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

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

export const CrvUsdStakingPage = () => {
  const params = useParams<NetworkUrlParams>()
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

  const isMobile = useIsMobile()

  // automatically minimize chart on smaller screens where the toggle button is hidden (the chart is already full width)
  useEffect(() => {
    if (isMobile && isChartExpanded) minimizeChart()
  }, [isChartExpanded, isMobile, minimizeChart])

  return (
    <DetailPageLayout
      header={
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: Spacing.sm,
            paddingInline: Spacing.sm,
            paddingBlock: Spacing.md,
          }}
        >
          <img height={55} src={RCScrvUSDLogoSM} alt="crvUSD logo" />
          <Box flex flexColumn>
            <Typography variant="headingMBold">{t`Savings crvUSD`}</Typography>
            <Typography variant="bodySRegular">{t`Let your idle crvUSD do more for you.`}</Typography>
          </Box>
        </Stack>
      }
      formTabs={<DepositWithdraw params={params} />}
    >
      {showStatsBanner && (
        <Fade in={showStatsBanner}>
          <div>
            <StatsBanner />
          </div>
        </Fade>
      )}
      {!isUserScrvUsdBalanceZero && <UserPosition />}
      <Statistics
        hideExpandChart={isMobile}
        isChartExpanded={isChartExpanded}
        toggleChartExpanded={toggleChartExpanded}
      />
      <UserInformation params={params} />
    </DetailPageLayout>
  )
}
