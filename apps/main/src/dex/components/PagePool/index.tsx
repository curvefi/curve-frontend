import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Address, isAddressEqual } from 'viem'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { Deposit } from '@/dex/components/PagePool/Deposit'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferFormType } from '@/dex/components/PagePool/types'
import { getSlippageType } from '@/dex/components/PagePool/utils'
import { Withdraw } from '@/dex/components/PagePool/Withdraw'
import { ROUTE } from '@/dex/constants'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { AdvancedDetails } from '@/dex/features/advanced-details'
import { PoolInformation } from '@/dex/features/pool-information'
import { UserPosition } from '@/dex/features/user-position'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import { PoolPageHeader } from '@/dex/widgets/page-header'
import type { Chain } from '@curvefi/prices-api'
import { AlertBox } from '@ui/AlertBox'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { FormMargins } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { PoolAlertBanner } from '../PoolAlertBanner'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

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
  const { data: pricesApiPoolsMapper } = usePoolsPricesApi({ blockchainId: networkId as Chain })
  const poolAddress = poolData?.pool.address as Address

  const pricesApiPoolData = poolData && pricesApiPoolsMapper?.[poolData.pool.address]

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
      Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId as Address, signerAddress)),
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

  const tabs: TabOption<TransferFormType>[] = useMemo(
    () => [
      { value: 'deposit', label: t`Deposit` },
      { value: 'withdraw', label: t`Withdraw` },
      { value: 'swap', label: t`Swap` },
      ...(isAvailableManageGauge ? [{ value: 'manage-gauge' as const, label: t`Gauge` }] : []),
    ],
    [isAvailableManageGauge],
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
        formTabs={
          <FormMargins>
            <TabsSwitcher
              variant="contained"
              value={rFormType || 'deposit'}
              onChange={key => toggleForm(key as TransferFormType)}
              options={tabs}
              testIdPrefix="pool-form-tab"
            />
            {rFormType === 'swap' ? (
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
            ) : rFormType === 'deposit' ? (
              <Deposit
                {...pageTransferProps}
                blockchainId={networkId}
                hasDepositAndStake={hasDepositAndStake}
                poolAlert={poolAlert}
                maxSlippage={maxSlippage}
                seed={seed}
                tokensMapper={tokensMapper}
              />
            ) : rFormType === 'withdraw' ? (
              <Withdraw
                {...pageTransferProps}
                blockchainId={networkId}
                poolAlert={poolAlert}
                maxSlippage={maxSlippage}
                seed={seed}
                tokensMapper={tokensMapper}
              />
            ) : (
              rFormType === 'manage-gauge' && poolData && <ManageGauge poolId={poolData.pool.id} chainId={rChainId} />
            )}
          </FormMargins>
        }
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
