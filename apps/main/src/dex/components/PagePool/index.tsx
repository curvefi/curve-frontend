import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { type Address, isAddressEqual } from 'viem'
import { useConfig } from 'wagmi'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { Deposit } from '@/dex/components/PagePool/Deposit'
import { PoolParameters } from '@/dex/components/PagePool/PoolDetails/PoolParameters'
import { PoolStats } from '@/dex/components/PagePool/PoolDetails/PoolStats'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferFormType } from '@/dex/components/PagePool/types'
import { MySharesStats } from '@/dex/components/PagePool/UserDetails'
import { Withdraw } from '@/dex/components/PagePool/Withdraw'
import { ROUTE } from '@/dex/constants'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Stack from '@mui/material/Stack'
import { AlertBox } from '@ui/AlertBox'
import { AppPageFormTitleWrapper, AppPageInfoContentWrapper } from '@ui/AppPage'
import { Box } from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { TextEllipsis } from '@ui/TextEllipsis'
import { scanAddressPath } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
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
  const poolAlert = usePoolAlert(poolData)
  const { tokensMapper } = useTokensMapper(rChainId)
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, poolId)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[chainIdPoolId])
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const fetchUserPoolInfo = useStore((state) => state.user.fetchUserPoolInfo)
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const pricesApiPoolsMapper = useStore((state) => state.pools.pricesApiPoolsMapper)
  const fetchPricesPoolSnapshots = useStore((state) => state.pools.fetchPricesPoolSnapshots)
  const snapshotsMapper = useStore((state) => state.pools.snapshotsMapper)

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
    },
    !!curve,
  )

  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { pool } = poolDataCacheOrApi
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { networkId, isLite, pricesApi } = network
  const poolAddress = poolData?.pool.address

  const pricesApiPoolData = poolData && pricesApiPoolsMapper[poolData.pool.address]

  type DetailInfoTab = 'user' | 'pool' | 'advanced'
  const poolInfoTabs = useMemo<TabOption<DetailInfoTab>[]>(
    () => [
      { value: 'pool' as const, label: t`Pool Details` },
      ...(signerAddress ? [{ value: 'user' as const, label: t`Your Details` }] : []),
      ...(pricesApi && pricesApiPoolData && snapshotsMapper[poolData?.pool.address]
        ? [{ value: 'advanced' as const, label: t`Advanced` }]
        : []),
    ],
    [signerAddress, pricesApi, pricesApiPoolData, snapshotsMapper, poolData?.pool.address],
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
    if (
      curve &&
      poolAddress &&
      pricesApi &&
      pricesApiPoolsMapper[poolAddress] !== undefined &&
      !snapshotsMapper[poolAddress]
    ) {
      void fetchPricesPoolSnapshots(rChainId, poolAddress)
    }
  }, [curve, fetchPricesPoolSnapshots, poolAddress, pricesApi, pricesApiPoolsMapper, rChainId, snapshotsMapper])

  // is seed
  useEffect(() => {
    if (!poolData || !currencyReserves) return

    const isSeed = Number(currencyReserves.total) === 0

    if (isSeed && poolData.hasWrapped) setPoolIsWrapped(poolData, true)
    setSeed({ isSeed, loaded: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id, currencyReserves?.total])

  // fetch user pool info
  const config = useConfig()
  useEffect(() => {
    if (curve && poolId && signerAddress) {
      void fetchUserPoolInfo(config, curve, poolId)
    }
  }, [rChainId, poolId, signerAddress, config, curve, fetchUserPoolInfo])

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
          poolAlertBannerKey={notFalsy('pool-alert-banner-dismissed', params.network, params.poolIdOrAddress).join('-')}
        />
      )}
      <DetailPageLayout
        formTabs={
          <FormMargins>
            {!isMdUp && <TitleComp />}
            <TabsSwitcher
              variant="contained"
              value={!rFormType ? 'deposit' : rFormType}
              onChange={(key) => toggleForm(key as TransferFormType)}
              options={tabs}
            />
            {rFormType === 'swap' ? (
              poolAlert?.isDisableSwap ? (
                <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
              ) : (
                <Swap
                  {...pageTransferProps}
                  chainIdPoolId={chainIdPoolId}
                  poolAlert={poolAlert}
                  maxSlippage={maxSlippage}
                  seed={seed}
                  tokensMapper={tokensMapper}
                />
              )
            ) : rFormType === 'deposit' ? (
              <Deposit
                {...pageTransferProps}
                chainIdPoolId={chainIdPoolId}
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
                chainIdPoolId={chainIdPoolId}
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
        {isMdUp && <TitleComp />}
        {poolAddress && <CampaignRewardsBanner chainId={rChainId} address={poolAddress} />}
        {!isLite && pricesApiPoolData && pricesApi && (
          <PriceAndTradesWrapper variant="secondary">
            <OhlcAndActivityComp rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
          </PriceAndTradesWrapper>
        )}
        <Stack>
          <TabsSwitcher variant="contained" value={poolInfoTab} onChange={setPoolInfoTab} options={poolInfoTabs} />
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
                  curve={curve}
                  routerParams={routerParams}
                  poolData={poolData}
                  poolDataCacheOrApi={poolDataCacheOrApi}
                  poolAlert={poolAlert}
                  tokensMapper={tokensMapper}
                />
              </StatsWrapper>
            )}
            {poolInfoTab === 'advanced' && poolData && snapshotsMapper[poolData.pool.address] !== undefined && (
              <PoolParameters pricesApi={pricesApi} poolData={poolData} rChainId={rChainId} />
            )}
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
    max-width: 7.125rem; // 114px;
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
