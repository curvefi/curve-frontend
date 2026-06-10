import { BigNumber } from 'bignumber.js'
import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { DepositWithdraw } from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import { Statistics } from '@/loan/components/PageCrvUsdStaking/Statistics'
import { StatsBanner } from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import { UserInformation } from '@/loan/components/PageCrvUsdStaking/UserInformation'
import { UserPosition } from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { networksIdMapper } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { RCScrvUSDLogoSM } from '@ui/images'
import { type LlamaApi, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useScrvUsdNewForms } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { PageHeader } from '@ui-kit/widgets/PageHeader'

const { IconSize } = SizesAndSpaces

function useLegacyFetching({
  lendApi,
  address,
  refetchUserScrvUsdBalance,
}: {
  lendApi: LlamaApi | null
  address: string | undefined
  refetchUserScrvUsdBalance: () => Promise<unknown>
}) {
  const enabled = !useScrvUsdNewForms()
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
  const chainId = networksIdMapper[params.network]
  const { llamaApi: lendApi = null } = useCurve()
  const { address, isConnecting } = useConnection()

  const {
    data: userScrvUsdBalance,
    isFetching: isUserScrvUsdBalanceFetching,
    isFetched: isUserScrvUsdBalanceFetched,
    refetch: refetchUserScrvUsdBalance,
  } = useScrvUsdUserBalances({ userAddress: address, chainId })

  useLegacyFetching({ lendApi, address, refetchUserScrvUsdBalance })

  const isUserScrvUsdBalanceZero = !address || !userScrvUsdBalance || BigNumber(userScrvUsdBalance.scrvUSD).isZero()

  const connectedUserNoScrvUsdBalance = [address, isUserScrvUsdBalanceFetched, isUserScrvUsdBalanceZero].every(Boolean)

  const showStatsBanner =
    connectedUserNoScrvUsdBalance ||
    !address ||
    (!isConnecting && !isUserScrvUsdBalanceFetching && isUserScrvUsdBalanceZero)

  return (
    <DetailPageLayout
      header={
        <PageHeader
          icon={<Box component="img" sx={{ height: IconSize.xxl }} src={RCScrvUSDLogoSM} alt="crvUSD logo" />}
          title={t`Savings crvUSD`}
          subtitle={t`Let your idle crvUSD do more for you.`}
        />
      }
      formTabs={<DepositWithdraw params={params} />}
      testId="scrvusd-page"
    >
      {showStatsBanner && (
        <Fade in={showStatsBanner}>
          <StatsBanner />
        </Fade>
      )}
      {!isUserScrvUsdBalanceZero && <UserPosition chainId={chainId} />}
      <Statistics chainId={chainId} />
      <UserInformation params={params} />
    </DetailPageLayout>
  )
}
