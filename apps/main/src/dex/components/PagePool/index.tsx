import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Address, isAddressEqual } from 'viem'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { Deposit } from '@/dex/components/PagePool/Deposit'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferFormType, TransferProps } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { Withdraw } from '@/dex/components/PagePool/Withdraw'
import { ROUTE } from '@/dex/constants'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { PoolInformation } from '@/dex/features/pool-information'
import { PoolHistoricalBaseRateChart } from '@/dex/features/PoolHistoricalBaseRateChart'
import { UserPosition } from '@/dex/features/user-position'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import { PoolPageHeader } from '@/dex/widgets/page-header'
import type { Chain } from '@curvefi/prices-api'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useNavigate } from '@evm-ui/hooks/router'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { REFRESH_INTERVAL } from '@evm-ui/utils'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { FormMargins } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { AlertBox } from '@legacy-ui/AlertBox'
import { PoolAlertBanner } from '../PoolAlertBanner'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

type TransferTabsParams = TransferProps & {
  isAvailableManageGauge: boolean
  isGaugeManager: boolean
  isRewardsDistributor: boolean
}

const DepositTab = (params: TransferTabsParams) => <Deposit {...params} />

const WithdrawTab = (params: TransferTabsParams) => <Withdraw {...params} />

const SwapTab = ({ poolAlert, maxSlippage, seed, tokensMapper, ...pageTransferProps }: TransferTabsParams) =>
  poolAlert?.isDisableSwap ? (
    <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
  ) : (
    <Swap
      {...pageTransferProps}
      poolAlert={poolAlert}
      maxSlippage={maxSlippage}
      seed={seed}
      tokensMapper={tokensMapper}
    />
  )

const ManageGaugeTab = ({ poolData, routerParams, isGaugeManager, isRewardsDistributor }: TransferTabsParams) =>
  poolData ? (
    <ManageGauge
      poolId={poolData.pool.id}
      chainId={routerParams.rChainId}
      isGaugeManager={isGaugeManager}
      isRewardsDistributor={isRewardsDistributor}
    />
  ) : null

const menu = [
  { value: 'deposit', label: t`Deposit`, component: DepositTab },
  { value: 'withdraw', label: t`Withdraw`, component: WithdrawTab },
  { value: 'swap', label: t`Swap`, component: SwapTab },
  {
    value: 'manage-gauge',
    label: t`Gauge`,
    visible: (p: TransferTabsParams) => p.isAvailableManageGauge,
    component: ManageGaugeTab,
  },
] as const

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const { signerAddress } = curve ?? {}
  const push = useNavigate()
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

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager(
    { chainId: rChainId, poolId: poolData?.pool.id },
    !!curve,
  )

  const { data: rewardDistributors, isPending: isPendingRewardsDistributors } = useGaugeRewardsDistributors(
    { chainId: rChainId, poolId: poolData?.pool.id, userAddress: signerAddress },
    !!curve,
  )

  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { networkId, isLite, pricesApi } = network
  const poolAddress = poolData?.pool.address as Address
  const { data: pricesApiPoolData } = usePoolPricesApi({ blockchainId: networkId as Chain, poolAddress })

  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  usePageVisibleInterval(() => {
    if (curve && poolData) {
      void fetchPoolStats(curve, poolData)
    }
  }, REFRESH_INTERVAL['5m'])

  // is seed
  useEffect(() => {
    if (!poolData || !currencyReserves) return

    const isSeed = Number(currencyReserves.total) === 0

    if (isSeed && poolData.hasWrapped) setPoolIsWrapped(poolData, true)
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setSeed({ isSeed, loaded: true })
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolData?.pool?.id, currencyReserves?.total])

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId, signerAddress)),
    [rewardDistributors, signerAddress],
  )

  const isGaugeManager = useMemo(
    () => !!gaugeManager && !!signerAddress && isAddressEqual(gaugeManager, signerAddress),
    [gaugeManager, signerAddress],
  )

  const isAvailableManageGauge = useMemo(
    () => !isPendingGaugeManager && !isPendingRewardsDistributors && (isRewardsDistributor || isGaugeManager),
    [isGaugeManager, isPendingGaugeManager, isPendingRewardsDistributors, isRewardsDistributor],
  )

  const toggleForm = useCallback(
    (updatedFormType: TransferFormType) => {
      push(getPath(params, `${ROUTE.PAGE_POOLS}/${params.poolIdOrAddress}/${updatedFormType}`))
    },
    [push, params],
  )

  useEffect(() => {
    if (!isAvailableManageGauge && rFormType === 'manage-gauge') {
      toggleForm('deposit')
    }
  }, [isAvailableManageGauge, rFormType, toggleForm])

  const {
    content,
    tab: { value },
    tabs,
  } = useTabs({
    menu,
    params: useMemo(
      () => ({
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
        isAvailableManageGauge,
        isGaugeManager,
        isRewardsDistributor,
      }),
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
        isAvailableManageGauge,
        isGaugeManager,
        isRewardsDistributor,
      ],
    ),
    value: rFormType,
  })

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
          content: (
            <FormMargins>
              <TabsSwitcher
                variant="contained"
                value={value}
                options={useMemo(
                  () =>
                    tabs.map(tab => ({
                      ...tab,
                      href: getInternalUrl(
                        'dex',
                        params.network,
                        `${ROUTE.PAGE_POOLS}/${params.poolIdOrAddress}/${tab.value}`,
                      ),
                    })),
                  [tabs, params.network, params.poolIdOrAddress],
                )}
                testIdPrefix="pool-form-tab"
              />
              {content}
            </FormMargins>
          ),
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
