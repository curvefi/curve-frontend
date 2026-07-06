import { BigNumber } from 'bignumber.js'
import { useConnection } from 'wagmi'
import { DepositWithdraw } from '@/loan/components/PageCrvUsdStaking/DepositWithdraw'
import { Statistics } from '@/loan/components/PageCrvUsdStaking/Statistics'
import { StatsBanner } from '@/loan/components/PageCrvUsdStaking/StatsBanner'
import { UserInformation } from '@/loan/components/PageCrvUsdStaking/UserInformation'
import { UserPosition } from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { networksIdMapper } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { RCScrvUSDLogoSM } from '@ui/images'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { PageHeader } from '@ui-kit/widgets/PageHeader'

const { IconSize } = SizesAndSpaces

export const CrvUsdStakingPage = () => {
  const params = useParams<NetworkUrlParams>()
  const chainId = networksIdMapper[params.network]
  const { address, isConnecting } = useConnection()

  const {
    data: userScrvUsdBalance,
    isFetching: isUserScrvUsdBalanceFetching,
    isFetched: isUserScrvUsdBalanceFetched,
  } = useScrvUsdUserBalances({ userAddress: address, chainId })

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
      formTabs={{ content: <DepositWithdraw params={params} /> }}
      testId="scrvusd-page"
    >
      {showStatsBanner && (
        <Fade in={showStatsBanner}>
          <Box>
            <StatsBanner />
          </Box>
        </Fade>
      )}
      {!isUserScrvUsdBalanceZero && <UserPosition chainId={chainId} />}
      <Statistics chainId={chainId} />
      <UserInformation params={params} />
    </DetailPageLayout>
  )
}
