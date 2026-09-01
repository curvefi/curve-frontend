import { useEffect, useMemo, useState } from 'react'
import { type Address, isAddressEqual } from 'viem'
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
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { PoolInformation } from '@/dex/features/pool-information'
import { PoolHistoricalBaseRateChart } from '@/dex/features/PoolHistoricalBaseRateChart'
import { UserPosition } from '@/dex/features/user-position'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { PoolPageHeader } from '@/dex/widgets/page-header'
import { getBlockchainId } from '@curvefi/prices-api'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useLocation } from '@evm-ui/hooks/router'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { t } from '@evm-ui/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { REFRESH_INTERVAL } from '@evm-ui/utils'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { maybes } from '@primitives/objects.utils'
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
        component: ({ poolData, routerParams }) => (
          <AddRewardToken poolId={poolData.pool.id} chainId={routerParams.rChainId} />
        ),
      },
      {
        value: 'deposit_reward',
        label: t`Deposit Reward`,
        visible: p => !!p.isRewardsDistributor,
        component: ({ poolData, routerParams }) => (
          <DepositReward poolId={poolData.pool.id} chainId={routerParams.rChainId} />
        ),
      },
    ],
  },
] satisfies FormTab<TransferTabsParams>[]

/** Replaces old form-specific pool URLs for expanded-row links that should open a specific form tab. */
type PoolRouteState = {
  defaultTab?: (typeof menu)[number]['value']
}

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const { signerAddress } = curve ?? {}
  const poolAlert = usePoolAlert({
    network: params.network,
    poolAddress: poolData?.pool.address,
    hasVyperVulnerability: poolData?.hasVyperVulnerability,
  })
  const { tokensMapper } = useTokensMapper(rChainId)
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, poolId)
  const currencyReserves = useStore(state => state.pools.currencyReserves[chainIdPoolId])
  const setPoolIsWrapped = useStore(state => state.pools.setPoolIsWrapped)

  const maxSlippage = useUserProfileStore(state => state.maxSlippage[getSlippageType(poolData) ?? 'stable'])

  const { data: gaugeManager } = useGaugeManager({ chainId: rChainId, poolId: poolData?.pool.id })
  const { data: rewardDistributors } = useGaugeRewardsDistributors({
    chainId: rChainId,
    poolId: poolData?.pool.id,
    userAddress: signerAddress,
  })

  const [seed, setSeed] = useState(DEFAULT_SEED)
  const { state } = useLocation()
  const defaultTab = (state as PoolRouteState).defaultTab

  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { networkId, isLite, pricesApi } = network
  const poolAddress = poolData?.pool.address as Address
  const { data: pricesApiPoolData } = usePoolPricesApi({ blockchainId: getBlockchainId(networkId), poolAddress })

  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  usePageVisibleInterval(() => curve && poolData && void fetchPoolStats(curve, poolData), REFRESH_INTERVAL['5m'])

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
        curve,
        params,
        routerParams,
        hasDepositAndStake,
        poolData,
        poolDataCacheOrApi,
        blockchainId: networkId,
        poolAlert,
        maxSlippage,
        seed,
        tokensMapper,
        isGaugeManager: maybes([gaugeManager, signerAddress], isAddressEqual),
        isRewardsDistributor: maybes([rewardDistributors, signerAddress], (rewardDistributors, signerAddress) =>
          Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId, signerAddress)),
        ),
      },
    [
      curve,
      params,
      routerParams,
      hasDepositAndStake,
      poolData,
      poolDataCacheOrApi,
      networkId,
      poolAlert,
      maxSlippage,
      seed,
      tokensMapper,
      rewardDistributors,
      signerAddress,
      gaugeManager,
    ],
  )

  return (
    <>
      {poolAlert?.banner && (
        <PoolAlertBanner
          alertType={poolAlert.alertType}
          banner={poolAlert.banner}
          network={params.network}
          poolId={params.poolIdOrAddress}
        />
      )}
      <DetailPageLayout
        header={
          <PoolPageHeader
            chainId={rChainId}
            blockchainId={networkId}
            poolIdOrAddress={rPoolIdOrAddress}
            pricesApiPoolData={pricesApiPoolData}
            backHref={getInternalUrl('dex', networkId, DEX_ROUTES.PAGE_POOLS)}
          />
        }
        formTabs={{
          content: tabParams && <FormTabs menu={menu} params={tabParams} defaultValue={defaultTab} />,
        }}
      >
        {poolAddress && <CampaignRewardsBanner chainId={rChainId} address={poolAddress} />}
        <UserPosition
          blockchainId={networkId}
          chainId={rChainId}
          poolDataCacheOrApi={poolDataCacheOrApi}
          poolId={poolId}
        />
        {!isLite && pricesApiPoolData && pricesApi && (
          <OhlcAndActivityComp rChainId={rChainId} poolAddress={poolAddress} pricesApiPoolData={pricesApiPoolData} />
        )}
        {pricesApi && <PoolHistoricalBaseRateChart blockchainId={networkId} poolAddress={poolAddress} />}
        <PoolInformation
          curve={curve}
          routerParams={routerParams}
          poolData={poolData}
          poolDataCacheOrApi={poolDataCacheOrApi}
          poolAlert={poolAlert}
          pricesApiPoolData={pricesApiPoolData}
        />
        <AdvancedDetails routerParams={routerParams} poolData={poolData} poolDataCacheOrApi={poolDataCacheOrApi} />
      </DetailPageLayout>
    </>
  )
}
