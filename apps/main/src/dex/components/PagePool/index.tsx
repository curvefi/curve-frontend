import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { type Address, isAddressEqual } from 'viem'
import CampaignRewardsBanner from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import Deposit from '@/dex/components/PagePool/Deposit'
import PoolInfoData from '@/dex/components/PagePool/PoolDetails/ChartOhlcWrapper'
import PoolParameters from '@/dex/components/PagePool/PoolDetails/PoolParameters'
import PoolStats from '@/dex/components/PagePool/PoolDetails/PoolStats'
import Swap from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferFormType } from '@/dex/components/PagePool/types'
import MySharesStats from '@/dex/components/PagePool/UserDetails'
import Withdraw from '@/dex/components/PagePool/Withdraw'
import { ROUTE } from '@/dex/constants'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworkByChain } from '@/dex/entities/networks'
import usePoolAlert from '@/dex/hooks/usePoolAlert'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import { getUserPoolActiveKey } from '@/dex/store/createUserSlice'
import useStore from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import type { PoolUrlParams } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import AlertBox from '@ui/AlertBox'
import { AppFormContentWrapper } from '@ui/AppForm'
import {
  AppPageFormContainer,
  AppPageFormsWrapper,
  AppPageFormTitleWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import { ExternalLink } from '@ui/Link'
import { BlockSkeleton } from '@ui/skeleton'
import TextEllipsis from '@ui/TextEllipsis'
import { scanAddressPath } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import MonadBannerAlert from '../MonadBannerAlert'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }
const { MaxWidth } = SizesAndSpaces

const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolId } = routerParams
  const { signerAddress } = curve ?? {}
  const push = useNavigate()
  const poolAlert = usePoolAlert(poolData)
  const { tokensMapper } = useTokensMapper(rChainId)
  const userPoolActiveKey = curve && rPoolId ? getUserPoolActiveKey(curve, rPoolId) : ''
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, rPoolId)
  const userPoolBalances = useStore((state) => state.user.walletBalances[userPoolActiveKey])
  const userPoolBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
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
  const poolId = poolData?.pool?.id
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
  useEffect(() => {
    if (curve && poolId && signerAddress) {
      void fetchUserPoolInfo(curve, poolId)
    }
  }, [rChainId, poolId, signerAddress, curve, fetchUserPoolInfo])

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
      push(getPath(params, `${ROUTE.PAGE_POOLS}/${params.pool}/${updatedFormType}`))
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
      <MonadBannerAlert params={params as PoolUrlParams} />
      <AppPageFormContainer isAdvanceMode={true}>
        <AppPageFormsWrapper className="grid-transfer">
          <Stack
            sx={{
              width: { mobile: '100%', tablet: MaxWidth.actionCard },
              marginInline: { mobile: 'auto', desktop: 0 },
            }}
          >
            {!isMdUp && <TitleComp />}
            <TabsSwitcher
              variant="contained"
              size="medium"
              value={!rFormType ? 'deposit' : rFormType}
              onChange={(key) => toggleForm(key as TransferFormType)}
              options={tabs}
            />
            <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              {rFormType === 'swap' ? (
                <AppFormContentWrapper>
                  {poolAlert?.isDisableSwap ? (
                    <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
                  ) : (
                    <Swap
                      {...pageTransferProps}
                      chainIdPoolId={chainIdPoolId}
                      poolAlert={poolAlert}
                      maxSlippage={maxSlippage}
                      seed={seed}
                      tokensMapper={tokensMapper}
                      userPoolBalances={userPoolBalances}
                      userPoolBalancesLoading={userPoolBalancesLoading}
                    />
                  )}
                </AppFormContentWrapper>
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
                  userPoolBalances={userPoolBalances}
                  userPoolBalancesLoading={userPoolBalancesLoading}
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
                  userPoolBalances={userPoolBalances}
                  userPoolBalancesLoading={userPoolBalancesLoading}
                />
              ) : rFormType === 'manage-gauge' ? (
                poolData ? (
                  <ManageGauge poolId={poolData.pool.id} chainId={rChainId} />
                ) : (
                  <AppFormContentWrapper>
                    <BlockSkeleton width={339} />
                  </AppFormContentWrapper>
                )
              ) : null}
            </Stack>
          </Stack>
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && <TitleComp />}
          {poolAddress && (
            <Box>
              <CampaignRewardsBanner chainId={rChainId} address={poolAddress} />
            </Box>
          )}
          {!isLite && pricesApiPoolData && pricesApi && (
            <PriceAndTradesWrapper variant="secondary">
              <PoolInfoData rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
            </PriceAndTradesWrapper>
          )}
          <TabsSwitcher
            variant="contained"
            size="medium"
            value={poolInfoTab}
            onChange={setPoolInfoTab}
            options={poolInfoTabs}
          />

          <AppPageInfoContentWrapper variant="secondary">
            {poolInfoTab === 'user' && (
              <MySharesStats
                curve={curve}
                poolData={poolData}
                poolDataCacheOrApi={poolDataCacheOrApi}
                routerParams={routerParams}
                tokensMapper={tokensMapper}
                userPoolBalances={userPoolBalances}
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
        </AppPageInfoWrapper>
      </AppPageFormContainer>
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
  margin-bottom: var(--spacing-1);
  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: 0;
    margin-bottom: var(--spacing-3);
  }
  @media (min-width: ${breakpoints.lg}rem) {
    padding: 1.5rem 1.5rem;
  }
`

export default Transfer
