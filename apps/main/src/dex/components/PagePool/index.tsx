import { useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { type Address, isAddressEqual } from 'viem'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { Deposit } from '@/dex/components/PagePool/Deposit'
import { PoolParameters } from '@/dex/components/PagePool/PoolDetails/PoolParameters'
import { PoolStats } from '@/dex/components/PagePool/PoolDetails/PoolStats'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed } from '@/dex/components/PagePool/types'
import { MySharesStats } from '@/dex/components/PagePool/UserDetails'
import { Withdraw } from '@/dex/components/PagePool/Withdraw'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { AppPageFormTitleWrapper, AppPageInfoContentWrapper } from '@ui/AppPage'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { TextEllipsis } from '@ui/TextEllipsis'
import { scanAddressPath } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { PoolAlertBanner } from '../PoolAlertBanner'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

type PoolFormTabsProps = PageTransferProps & {
  chainIdPoolId: string
  blockchainId: string
  isAvailableManageGauge: boolean
  maxSlippage: string
  poolAlert: ReturnType<typeof usePoolAlert>
  seed: Seed
  tokensMapper: ReturnType<typeof useTokensMapper>['tokensMapper']
}

const BASE_POOL_FORM_MENU = [
  {
    value: 'deposit',
    label: t`Deposit`,
    component: Deposit,
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    component: Withdraw,
  },
  {
    value: 'swap',
    label: t`Swap`,
    component: Swap,
  },
  {
    value: 'manage-gauge',
    label: t`Gauge`,
    component: ({ poolData, routerParams }: PoolFormTabsProps) =>
      poolData && <ManageGauge poolId={poolData.pool.id} chainId={routerParams.rChainId} />,
    visible: ({ isAvailableManageGauge }: PoolFormTabsProps) => isAvailableManageGauge,
  },
] satisfies FormTab<PoolFormTabsProps>[]

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { curve, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const { signerAddress } = curve ?? {}
  const poolAlert = usePoolAlert(poolData)
  const { tokensMapper } = useTokensMapper(rChainId)
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, poolId)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[chainIdPoolId])
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)

  const storeMaxSlippage = useUserProfileStore((state) => state.maxSlippage[chainIdPoolId])

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager(
    {
      chainId: rChainId,
      poolId: poolData?.pool.id,
    },
    !!curve,
  )

  const { data: rewardDistributors, isPending: isPendingRewardsDistributors } = useGaugeRewardsDistributors(
    {
      chainId: rChainId,
      poolId: poolData?.pool.id,
      userAddress: signerAddress,
    },
    !!curve,
  )

  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { pool } = poolDataCacheOrApi
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { networkId, isLite, pricesApi } = network
  const { data: pricesApiPoolsMapper } = usePoolsPricesApi({ blockchainId: networkId as Chain })
  const poolAddress = poolData?.pool.address as Address
  const shouldFetchSnapshots = pricesApi && !!poolAddress
  const { data: snapshots } = usePoolSnapshots(
    {
      chain: networkId as Chain,
      poolAddress,
    },
    shouldFetchSnapshots,
  )
  const snapshotData = snapshots?.[0]

  const pricesApiPoolData = poolData && pricesApiPoolsMapper?.[poolData.pool.address]

  type DetailInfoTab = 'user' | 'pool' | 'advanced'
  const poolInfoTabs = useMemo<TabOption<DetailInfoTab>[]>(
    () => [
      { value: 'pool' as const, label: t`Pool Details` },
      ...(signerAddress ? [{ value: 'user' as const, label: t`Your Details` }] : []),
      ...(pricesApi && pricesApiPoolData && snapshotData ? [{ value: 'advanced' as const, label: t`Advanced` }] : []),
    ],
    [signerAddress, pricesApi, pricesApiPoolData, snapshotData],
  )
  const [poolInfoTab, setPoolInfoTab] = useState<DetailInfoTab>('pool')

  const maxSlippage = useMemo(() => {
    if (storeMaxSlippage) return storeMaxSlippage
    if (!pool) return ''

    return pool.isCrypto ? '0.1' : '0.03'
  }, [storeMaxSlippage, pool])

  usePageVisibleInterval(() => {
    if (curve && poolData) {
      void fetchPoolStats(curve, poolData)
    }
  }, REFRESH_INTERVAL['5m'])

  useEffect(() => {
    if (!poolData || !currencyReserves) return

    const isSeed = Number(currencyReserves.total) === 0

    if (isSeed && poolData.hasWrapped) setPoolIsWrapped(poolData, true)
    setSeed({ isSeed, loaded: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id, currencyReserves?.total])

  const isRewardsDistributor = useMemo(
    () =>
      !!rewardDistributors &&
      !!signerAddress &&
      Object.values(rewardDistributors).some((distributorId) =>
        isAddressEqual(distributorId as Address, signerAddress),
      ),
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

  const poolFormTabsParams = useMemo(
    () => ({
      ...pageTransferProps,
      blockchainId: networkId,
      chainIdPoolId,
      isAvailableManageGauge,
      maxSlippage,
      poolAlert,
      seed,
      tokensMapper,
    }),
    [chainIdPoolId, isAvailableManageGauge, maxSlippage, networkId, pageTransferProps, poolAlert, seed, tokensMapper],
  )

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      <StyledExternalLink href={scanAddressPath(network, pool.address)}>
        <Title as="h1">{pool?.name || ''}</Title>
      </StyledExternalLink>
    </AppPageFormTitleWrapper>
  )

  return (
    <>
      {poolAlert?.banner && (
        <PoolAlertBanner
          alertType={poolAlert.alertType}
          banner={poolAlert.banner}
          poolAlertBannerKey={notFalsy(
            'pool-alert-banner-dismissed',
            pageTransferProps.params.network,
            pageTransferProps.params.poolIdOrAddress,
          ).join('-')}
        />
      )}
      <DetailPageLayout
        formTabs={
          <>
            {!isMdUp && <TitleComp />}
            <FormTabs params={poolFormTabsParams} menu={BASE_POOL_FORM_MENU} testIdPrefix="pool-form-tab" />
          </>
        }
      >
        {isMdUp && <TitleComp />}
        {poolAddress && <CampaignRewardsBanner chainId={rChainId} address={poolAddress} />}
        {!isLite && pricesApiPoolData && pricesApi && (
          <PriceAndTradesWrapper variant="secondary">
            <OhlcAndActivityComp
              rChainId={rChainId}
              poolAddress={poolAddress as Address}
              pricesApiPoolData={pricesApiPoolData}
            />
          </PriceAndTradesWrapper>
        )}
        <Stack>
          <TabsSwitcher
            variant="contained"
            value={poolInfoTab}
            onChange={setPoolInfoTab}
            options={poolInfoTabs}
            testIdPrefix="pool-info-tab"
          />
          <AppPageInfoContentWrapper variant="secondary">
            {poolInfoTab === 'user' && (
              <MySharesStats
                curve={curve}
                poolData={poolData}
                poolDataCacheOrApi={poolDataCacheOrApi}
                routerParams={routerParams}
                tokensMapper={tokensMapper}
              />
            )}
            {poolInfoTab === 'pool' && (
              <StatsWrapper
                as="section"
                className={!curve || !poolData ? 'loading' : ''}
                grid
                gridRowGap="1rem"
                variant="secondary"
              >
                <PoolStats
                  routerParams={routerParams}
                  poolData={poolData}
                  poolDataCacheOrApi={poolDataCacheOrApi}
                  poolAlert={poolAlert}
                  tokensMapper={tokensMapper}
                />
              </StatsWrapper>
            )}
            {poolInfoTab === 'advanced' && poolData && <PoolParameters poolData={poolData} rChainId={rChainId} />}
          </AppPageInfoContentWrapper>
        </Stack>
      </DetailPageLayout>
    </>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: var(--nav--page--color);
`

const Title = styled(TextEllipsis)`
  color: var(--page--text-color);
  font-size: var(--font-size-5);

  @media (max-width: ${breakpoints.xxs}rem) {
    max-width: 7.125rem;
  }
`

const StatsWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;
`

const PriceAndTradesWrapper = styled(Box)`
  padding: 1.5rem 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem 1.5rem;
  }
`
