import { useEffect, useMemo, useState } from 'react'
import { isAddressEqual } from 'viem'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { TabGuard } from '@/dex/components/PagePool/components/TabGuard'
import { FormDeposit } from '@/dex/components/PagePool/Deposit/components/FormDeposit'
import { FormDepositStake } from '@/dex/components/PagePool/Deposit/components/FormDepositStake'
import { FormStake } from '@/dex/components/PagePool/Deposit/components/FormStake'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferTabsParams } from '@/dex/components/PagePool/types'
import {
  getDepositTabAlert,
  getSlippageType,
  getStakeTabAlert,
  getSwapTabAlert,
  getWithdrawTabAlert,
} from '@/dex/components/PagePool/utils'
import { FormClaim } from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import { FormUnstake } from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import { FormWithdraw } from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge/model/gauge.query'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { usePoolContext } from '@/dex/features/pool-context'
import { PoolInformation } from '@/dex/features/pool-information'
import { PoolHistoricalBaseRateChart } from '@/dex/features/PoolHistoricalBaseRateChart'
import { UserPosition } from '@/dex/features/user-position'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { PoolPageHeader } from '@/dex/widgets/page-header'
import type { Chain } from '@curvefi/prices-api'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useLocation } from '@evm-ui/hooks/router'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { maybes } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { REFRESH_INTERVAL } from '@ui/utils/time'
import { PoolAlertBanner } from '../PoolAlertBanner'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

const menu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    subTabs: [
      {
        value: 'DEPOSIT',
        label: t`Deposit`,
        component: props => <TabGuard alert={getDepositTabAlert} otherwise={FormDeposit} {...props} />,
      },
      {
        value: 'STAKE',
        label: t`Stake`,
        component: props => <TabGuard alert={getStakeTabAlert} otherwise={FormStake} {...props} />,
      },
      {
        value: 'DEPOSIT_STAKE',
        label: t`Deposit & Stake`,
        component: props => <TabGuard alert={getStakeTabAlert} otherwise={FormDepositStake} {...props} />,
      },
    ],
  } satisfies FormTab<TransferTabsParams>,
  {
    value: 'withdraw',
    label: t`Withdraw`,
    subTabs: [
      {
        value: 'WITHDRAW',
        label: t`Withdraw`,
        component: props => <TabGuard alert={getWithdrawTabAlert} otherwise={FormWithdraw} {...props} />,
      },
      {
        value: 'UNSTAKE',
        label: t`Unstake`,
        component: FormUnstake,
      },
      {
        value: 'CLAIM',
        label: t`Claim Rewards`,
        component: FormClaim,
      },
    ],
  } satisfies FormTab<TransferTabsParams>,
  {
    value: 'swap',
    label: t`Swap`,
    component: props => <TabGuard alert={getSwapTabAlert} otherwise={Swap} {...props} />,
  },
  {
    value: 'manage-gauge',
    label: t`Gauge`,
    visible: p => !!p.isGaugeManager || !!p.isRewardsDistributor,
    subTabs: [
      {
        value: 'add_reward',
        label: t`Add Reward`,
        visible: p => !!p.isGaugeManager,
        component: () => <AddRewardToken />,
      },
      {
        value: 'deposit_reward',
        label: t`Deposit Reward`,
        visible: p => !!p.isRewardsDistributor,
        component: () => <DepositReward />,
      },
    ],
  },
] satisfies FormTab<TransferTabsParams>[]

/** Replaces old form-specific pool URLs for expanded-row links that should open a specific form tab. */
type PoolRouteState = {
  defaultTab?: (typeof menu)[number]['value']
}

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, hasDepositAndStake } = pageTransferProps
  const { chainId, blockchainId, poolId, poolAddress, poolData, api: curve } = usePoolContext()

  const poolAlert = usePoolAlert({ blockchainId, poolAddress, hasVyperVulnerability: poolData?.hasVyperVulnerability })
  const { tokensMapper } = useTokensMapper(chainId)
  const chainIdPoolId = getChainPoolIdActiveKey(chainId, poolId)
  const currencyReserves = useStore(state => state.pools.currencyReserves[chainIdPoolId])
  const setPoolIsWrapped = useStore(state => state.pools.setPoolIsWrapped)

  const maxSlippage = useUserProfileStore(state => state.maxSlippage[getSlippageType(poolData) ?? 'stable'])

  const { signerAddress } = curve ?? {}
  const { data: gaugeManager } = useGaugeManager({ chainId, poolId })
  const { data: rewardDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress: signerAddress })

  const [seed, setSeed] = useState(DEFAULT_SEED)
  const { state } = useLocation()
  const defaultTab = (state as PoolRouteState).defaultTab

  const { data: pricesApiPoolData } = usePoolPricesApi({ blockchainId: blockchainId as Chain, poolAddress })

  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  usePageVisibleInterval(() => curve && void fetchPoolStats(curve, poolData), REFRESH_INTERVAL['5m'])

  // is seed
  useEffect(() => {
    if (!poolData || !currencyReserves) return

    const isSeed = Number(currencyReserves.total) === 0

    if (isSeed && poolData.hasWrapped) setPoolIsWrapped(poolData, true)
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setSeed({ isSeed, loaded: true })
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolData?.pool?.id, currencyReserves?.total])

  const tabParams = useMemo(
    () =>
      poolData && {
        params,
        hasDepositAndStake,
        poolAlert,
        maxSlippage,
        seed,
        tokensMapper,
        isGaugeKilled: poolData.gauge.isKilled ?? undefined,
        isGaugeManager: maybes([gaugeManager, signerAddress], isAddressEqual),
        isRewardsDistributor: maybes([rewardDistributors, signerAddress], (rewardDistributors, signerAddress) =>
          Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId, signerAddress)),
        ),
      },
    [
      poolData,
      params,
      hasDepositAndStake,
      poolAlert,
      maxSlippage,
      seed,
      tokensMapper,
      gaugeManager,
      signerAddress,
      rewardDistributors,
    ],
  )

  return (
    <>
      {poolAlert?.banner && (
        <PoolAlertBanner
          alertType={poolAlert.alertType}
          banner={poolAlert.banner}
          network={blockchainId}
          poolId={poolId}
        />
      )}
      <DetailPageLayout
        header={
          <PoolPageHeader
            chainId={chainId}
            blockchainId={blockchainId}
            poolIdOrAddress={poolId}
            title={poolData.pool.name}
            tokenList={useMemo(
              () =>
                poolData?.tokens
                  .map((symbol, index) => ({ symbol, address: poolData.tokenAddresses[index] ?? '' }))
                  .filter(({ address }) => address) ?? [],
              [poolData.tokenAddresses, poolData?.tokens],
            )}
            isLoading={false} // for now the page only renders when pool data has already loaded, it's not lazy yet.
            pricesApiPoolData={pricesApiPoolData}
            backHref={getInternalUrl('dex', blockchainId, DEX_ROUTES.PAGE_POOLS)}
          />
        }
        formTabs={{
          content: tabParams && <FormTabs menu={menu} params={tabParams} defaultValue={defaultTab} />,
        }}
      >
        <CampaignRewardsBanner />
        <UserPosition />
        {!isLiteChain(chainId) && pricesApiPoolData && (
          <OhlcAndActivityComp rChainId={chainId} poolAddress={poolAddress} pricesApiPoolData={pricesApiPoolData} />
        )}
        {!isLiteChain(chainId) && <PoolHistoricalBaseRateChart blockchainId={blockchainId} poolAddress={poolAddress} />}
        <PoolInformation poolAlert={poolAlert} pricesApiPoolData={pricesApiPoolData} />
        <AdvancedDetails />
      </DetailPageLayout>
    </>
  )
}
