import type {
  DetailInfoTypes,
  EstimatedGas,
  PageTransferProps,
  PoolInfoTab,
  Seed,
  Slippage,
  TransferFormType,
} from '@/dex/components/PagePool/types'
import { t } from '@ui-kit/lib/i18n'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ROUTE } from '@/dex/constants'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import usePoolAlert from '@/dex/hooks/usePoolAlert'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import { getUserPoolActiveKey } from '@/dex/store/createUserSlice'
import useStore from '@/dex/store/useStore'
import { breakpoints } from '@ui/utils/responsive'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { useNavigate } from 'react-router-dom'
import Deposit from '@/dex/components/PagePool/Deposit'
import PoolStats from '@/dex/components/PagePool/PoolDetails/PoolStats'
import Swap from '@/dex/components/PagePool/Swap'
import MySharesStats from '@/dex/components/PagePool/UserDetails'
import Withdraw from '@/dex/components/PagePool/Withdraw'
import AlertBox from '@ui/AlertBox'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@ui/AppForm'
import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@ui/AppPage'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import { ExternalLink } from '@ui/Link'
import Tabs, { Tab } from '@ui/Tab'
import TextEllipsis from '@ui/TextEllipsis'
import CampaignRewardsBanner from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import PoolInfoData from '@/dex/components/PagePool/PoolDetails/ChartOhlcWrapper'
import PoolParameters from '@/dex/components/PagePool/PoolDetails/PoolParameters'
import { useGaugeManager } from '@/dex/entities/gauge'
import { BlockSkeleton } from '@ui/skeleton'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import { isAddressEqual, type Address } from 'viem'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

export const DEFAULT_ESTIMATED_GAS: EstimatedGas = { loading: false, estimatedGas: null, error: null }

export const DEFAULT_SLIPPAGE: Slippage = {
  loading: false,
  slippage: null,
  isHighSlippage: false,
  isBonus: false,
  error: '',
}

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolId } = routerParams
  const { signerAddress } = curve ?? {}
  const navigate = useNavigate()
  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)

  const { tokensMapper } = useTokensMapper(rChainId)
  const userPoolActiveKey = curve && rPoolId ? getUserPoolActiveKey(curve, rPoolId) : ''
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, rPoolId)
  const userPoolBalances = useStore((state) => state.user.walletBalances[userPoolActiveKey])
  const userPoolBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[chainIdPoolId])
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.isMdUp)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const fetchUserPoolInfo = useStore((state) => state.user.fetchUserPoolInfo)
  const fetchPoolStats = useStore((state) => state.pools.fetchPoolStats)
  const setPoolIsWrapped = useStore((state) => state.pools.setPoolIsWrapped)
  const chartExpanded = useStore((state) => state.pools.pricesApiState.chartExpanded)
  const setChartExpanded = useStore((state) => state.pools.setChartExpanded)
  const pricesApiPoolsMapper = useStore((state) => state.pools.pricesApiPoolsMapper)
  const fetchPricesPoolSnapshots = useStore((state) => state.pools.fetchPricesPoolSnapshots)
  const snapshotsMapper = useStore((state) => state.pools.snapshotsMapper)
  const basePoolsLoading = useStore((state) => state.pools.basePoolsLoading)
  const { initCampaignRewards, initiated } = useStore((state) => state.campaigns)

  const globalMaxSlippage = useUserProfileStore((state) => state.maxSlippage[chainIdPoolId])

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager({
    chainId: rChainId,
    poolId: poolData?.pool.id!,
  })

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('pool')
  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { pool } = poolDataCacheOrApi
  const poolId = poolData?.pool?.id
  const { networkId, isLite, pricesApi, scanAddressPath } = useStore((state) => state.networks.networks[rChainId])
  const poolAddress = poolData?.pool.address

  const pricesApiPoolData = poolData && pricesApiPoolsMapper[poolData.pool.address]

  const poolInfoTabs = useMemo<PoolInfoTab[]>(() => {
    const tabs: PoolInfoTab[] = [{ label: t`Pool Details`, key: 'pool' }]

    if (!!signerAddress) {
      tabs.push({ label: t`Your Details`, key: 'user' })
    }
    if (pricesApi && pricesApiPoolData && snapshotsMapper[poolData?.pool.address]) {
      tabs.push({ label: t`Advanced`, key: 'advanced' })
    }

    return tabs
  }, [signerAddress, pricesApi, pricesApiPoolData, snapshotsMapper, poolData?.pool.address])

  const maxSlippage = useMemo(() => {
    if (globalMaxSlippage) return globalMaxSlippage
    if (!pool) return ''

    return pool.isCrypto ? '0.1' : '0.03'
  }, [globalMaxSlippage, pool])

  const navHeight = useMemo(() => layoutHeight.mainNav + layoutHeight.secondaryNav, [layoutHeight])

  const fetchData = useCallback(() => {
    if (isPageVisible && curve && poolData) {
      fetchPoolStats(curve, poolData)
    }
  }, [curve, fetchPoolStats, isPageVisible, poolData])

  usePageVisibleInterval(() => fetchData, REFRESH_INTERVAL['5m'], isPageVisible)

  useEffect(() => {
    if (
      curve &&
      poolAddress &&
      pricesApi &&
      pricesApiPoolsMapper[poolAddress] !== undefined &&
      !snapshotsMapper[poolAddress]
    ) {
      fetchPricesPoolSnapshots(rChainId, poolAddress)
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
    if (curve && poolId && !!signerAddress) {
      fetchUserPoolInfo(curve, poolId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rChainId, poolId, signerAddress])

  const isAvailableManageGauge = useMemo(
    () =>
      !isPendingGaugeManager &&
      !!signerAddress &&
      !!gaugeManager &&
      isAddressEqual(gaugeManager, signerAddress as Address),
    [isPendingGaugeManager, signerAddress, gaugeManager],
  )

  const ACTION_TABS: { key: TransferFormType; label: string }[] = [
    { key: 'deposit', label: t`Deposit` },
    { key: 'withdraw', label: t`Withdraw/Claim` },
    { key: 'swap', label: t`Swap` },
  ]

  const toggleForm = useCallback(
    (updatedFormType: TransferFormType) => {
      const pathname = getPath(params, `${ROUTE.PAGE_POOLS}/${params.pool}/${updatedFormType}`)
      navigate(pathname)
    },
    [navigate, params],
  )

  useEffect(() => {
    if (!isAvailableManageGauge && rFormType === 'manage-gauge') {
      toggleForm('deposit')
    }
  }, [isAvailableManageGauge, rFormType, toggleForm])

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      <StyledExternalLink href={scanAddressPath(pool.address)}>
        <Title as="h1">{pool?.name || ''}</Title>
      </StyledExternalLink>
    </AppPageFormTitleWrapper>
  )

  // init rewardsMapper
  useEffect(() => {
    if (!initiated) {
      initCampaignRewards(rChainId)
    }
  }, [initCampaignRewards, rChainId, initiated])

  useEffect(() => {
    if (!isMdUp && chartExpanded) setChartExpanded(false)
  }, [chartExpanded, isMdUp, setChartExpanded])

  return (
    <>
      {!isLite && pricesApiPoolData && pricesApi && chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex padding="0 0 0 var(--spacing-3)">
            <TitleComp />
            <ExpandButton variant={'select'} onClick={() => setChartExpanded(!chartExpanded)}>
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <PoolInfoData rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}

      <Wrapper isAdvanceMode={true} chartExpanded={chartExpanded}>
        <AppPageFormsWrapper navHeight={navHeight} className="grid-transfer">
          {!isMdUp && <TitleComp />}
          <AppFormContent variant="primary" shadowed>
            <AppFormHeader
              formTypes={ACTION_TABS}
              activeFormKey={!rFormType ? 'deposit' : (rFormType as string)}
              handleClick={(key: string) => toggleForm(key as TransferFormType)}
              showMenuButton={isAvailableManageGauge}
            />

            <AppFormContentWrapper>
              {rFormType === 'swap' ? (
                <>
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
                </>
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
                  <BlockSkeleton width={339} />
                )
              ) : null}
            </AppFormContentWrapper>
          </AppFormContent>
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && !chartExpanded && <TitleComp />}
          {poolAddress && (
            <Box>
              <CampaignRewardsBanner address={poolAddress} />
            </Box>
          )}
          {!isLite && pricesApiPoolData && pricesApi && !chartExpanded && (
            <PriceAndTradesWrapper variant="secondary">
              <PoolInfoData rChainId={rChainId} pricesApiPoolData={pricesApiPoolData} />
            </PriceAndTradesWrapper>
          )}
          <AppPageInfoTabsWrapper>
            <Tabs>
              {poolInfoTabs.map(({ key, label }) => (
                <Tab
                  key={key}
                  className={selectedTab === key ? 'active' : ''}
                  variant="secondary"
                  disabled={!curve || !poolData}
                  onClick={() => setSelectedTab(key)}
                >
                  {label}
                </Tab>
              ))}
            </Tabs>
          </AppPageInfoTabsWrapper>

          <AppPageInfoContentWrapper variant="secondary">
            {selectedTab === 'user' && (
              <MySharesStats
                curve={curve}
                poolData={poolData}
                poolDataCacheOrApi={poolDataCacheOrApi}
                routerParams={routerParams}
                tokensMapper={tokensMapper}
                userPoolBalances={userPoolBalances}
              />
            )}
            {selectedTab === 'pool' && (
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
            {selectedTab === 'advanced' &&
              poolData &&
              snapshotsMapper[poolData.pool.address] !== undefined &&
              !basePoolsLoading && <PoolParameters pricesApi={pricesApi} poolData={poolData} rChainId={rChainId} />}
          </AppPageInfoContentWrapper>
        </AppPageInfoWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(AppPageFormContainer)<{ chartExpanded: boolean }>`
  @media (min-width: ${breakpoints.md}rem) {
    ${({ chartExpanded }) => chartExpanded && `margin-top: 1.5rem;`};
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--nav--page--color);
  text-transform: none;
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

const PriceAndTradesExpandedContainer = styled(Box)`
  margin: 1.5rem 0 0;
  display: flex;
  @media (min-width: ${breakpoints.md}rem) {
    flex-direction: column;
  }
`

const PriceAndTradesExpandedWrapper = styled(Box)``

const ExpandButton = styled(Button)`
  margin: auto var(--spacing-3) auto auto;
  display: flex;
  align-content: center;
  color: inherit;
  font-size: var(--font-size-2);
`

const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default Transfer
