import type {
  DetailInfoTypes,
  EstimatedGas,
  PageTransferProps,
  PoolInfoTab,
  Seed,
  Slippage,
  TransferFormType,
} from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { REFRESH_INTERVAL, ROUTE } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import usePoolAlert from '@/hooks/usePoolAlert'
import useTokensMapper from '@/hooks/useTokensMapper'
import networks from '@/networks'
import { getUserPoolActiveKey } from '@/store/createUserSlice'
import useStore from '@/store/useStore'
import { breakpoints } from '@/ui/utils/responsive'
import { getChainPoolIdActiveKey } from '@/utils'
import { getPath } from '@/utils/utilsRouter'
import { useNavigate } from 'react-router-dom'

import Deposit from '@/components/PagePool/Deposit'
import PoolStats from '@/components/PagePool/PoolDetails/PoolStats'
import Swap from '@/components/PagePool/Swap'
import MySharesStats from '@/components/PagePool/UserDetails'
import Withdraw from '@/components/PagePool/Withdraw'
import AlertBox from '@/ui/AlertBox'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@/ui/AppForm'
import {
  AppPageFormContainer,
  AppPageFormTitleWrapper,
  AppPageFormsWrapper,
  AppPageInfoContentWrapper,
  AppPageInfoTabsWrapper,
  AppPageInfoWrapper,
} from '@/ui/AppPage'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'
import Tabs, { Tab } from '@/ui/Tab'
import TextEllipsis from '@/ui/TextEllipsis'
import { Chip } from '@/ui/Typography'

import CampaignRewardsBanner from '@/components/PagePool/components/CampaignRewardsBanner'
import PoolInfoData from '@/components/PagePool/PoolDetails/ChartOhlcWrapper'
import PoolParameters from '@/components/PagePool/PoolDetails/PoolParameters'
import { useGaugeManager } from '@/entities/gauge'
import Loader from '@/ui/Loader'
import { ManageGauge } from '@/widgets/manage-gauge'
import { isAddressEqual, type Address } from 'viem'

export const DEFAULT_ESTIMATED_GAS: EstimatedGas = {
  loading: false,
  estimatedGas: null,
  error: null,
}

export const DEFAULT_SLIPPAGE: Slippage = {
  loading: false,
  slippage: null,
  isHighSlippage: false,
  isBonus: false,
  error: '',
}

const DEFAULT_SEED: Seed = {
  isSeed: null,
  cryptoSeedInitialRate: '',
  loaded: false,
  error: '',
}

const Transfer: React.FC<PageTransferProps> = (pageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolId } = routerParams
  const { chainId, signerAddress } = curve ?? {}
  const navigate = useNavigate()
  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)

  const { tokensMapper } = useTokensMapper(rChainId)
  const userPoolActiveKey = curve && rPoolId ? getUserPoolActiveKey(curve, rPoolId) : ''
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, rPoolId)
  const userPoolBalances = useStore((state) => state.user.walletBalances[userPoolActiveKey])
  const userPoolBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[chainIdPoolId])
  const globalMaxSlippage = useStore((state) => state.maxSlippage[chainIdPoolId])
  const isPageVisible = useStore((state) => state.isPageVisible)
  const isMdUp = useStore((state) => state.isMdUp)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const themeType = useStore((state) => state.themeType)
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

  const { data: gaugeManager, isPending: isPendingGaugeManager } = useGaugeManager(poolData?.pool.id!)

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('pool')
  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { pool } = poolDataCacheOrApi
  const poolId = poolData?.pool?.id
  const imageBaseUrl = networks[rChainId].imageBaseUrl
  const poolAddress = poolData?.pool.address

  const pricesApi = networks[rChainId].pricesApi
  const pricesApiPoolData = poolData && pricesApiPoolsMapper[poolData.pool.address]

  const poolInfoTabs = useMemo<PoolInfoTab[]>(() => {
    const tabs: PoolInfoTab[] = [{ label: t`Pool Details`, key: 'pool' }]

    if (!!signerAddress) {
      tabs.push({ label: t`Your Details`, key: 'user' })
    }
    if (pricesApi && pricesApiPoolData && snapshotsMapper[poolData?.pool.address]) {
      tabs.push({ label: t`Advanced`, key: 'advanced' })
    }
    if (
      !isPendingGaugeManager &&
      !!signerAddress &&
      !!gaugeManager &&
      isAddressEqual(gaugeManager, signerAddress as Address)
    ) {
      tabs.push({ label: t`Manage Gauge`, key: 'gauge' })
    }

    return tabs
  }, [
    signerAddress,
    pricesApi,
    pricesApiPoolData,
    snapshotsMapper,
    poolData?.pool.address,
    isPendingGaugeManager,
    gaugeManager,
  ])

  const maxSlippage = useMemo(() => {
    if (globalMaxSlippage) return globalMaxSlippage
    if (!pool) return ''

    return pool.isCrypto ? '0.1' : '0.03'
  }, [globalMaxSlippage, pool])

  const navHeight = useMemo(() => {
    return layoutHeight.mainNav + layoutHeight.secondaryNav
  }, [layoutHeight])

  const fetchSeedData = useCallback(
    async (chainId: ChainId, poolData: PoolData, currencyReserves: CurrencyReserves) => {
      try {
        const { hasWrapped, pool } = poolData
        let resp = cloneDeep(DEFAULT_SEED)

        if (currencyReserves.total !== '0') {
          resp.isSeed = false
        } else if (!pool.isCrypto) {
          resp.isSeed = true
        } else {
          if (hasWrapped) {
            setPoolIsWrapped(poolData, true)
          }

          const seedTokens = hasWrapped ? pool.wrappedCoins : pool.underlyingCoins
          resp.cryptoSeedInitialRate = await networks[chainId].api.poolDeposit.cryptoSeedInitialRate(pool, seedTokens)
          resp.isSeed = true
        }

        setSeed({ ...resp, loaded: true })
      } catch (error) {
        console.error(error)
        const errorMessage = error?.message || t`Unable to get seed initial rate`
        setSeed({ ...DEFAULT_SEED, error: errorMessage, loaded: true })
      }
    },
    [setPoolIsWrapped]
  )

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

  // seed crypto pool initial rate
  useEffect(() => {
    if (chainId && poolData && !isUndefined(currencyReserves)) {
      fetchSeedData(chainId, poolData, currencyReserves)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, currencyReserves?.total])

  // fetch user pool info
  useEffect(() => {
    if (curve && poolId && !!signerAddress) {
      fetchUserPoolInfo(curve, poolId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolId, signerAddress])

  const FORM_TYPES: { key: TransferFormType; label: string }[] = [
    { key: 'deposit', label: t`Deposit` },
    { key: 'withdraw', label: themeType === 'chad' ? t`Withdraw Claim` : t`Withdraw/Claim` },
    { key: 'swap', label: t`Swap` },
  ]

  const toggleForm = (updatedFormType: TransferFormType) => {
    const pathname = getPath(params, `${ROUTE.PAGE_POOLS}/${params.pool}/${updatedFormType}`)
    navigate(pathname)
  }

  const TitleComp = () => {
    const referenceAsset: { [referenceAsset: string]: string } = {
      CRYPTO: t`CRYPTO V2`,
      OTHER: t`OTHER`,
    }
    return (
      <AppPageFormTitleWrapper>
        <StyledExternalLink href={networks[rChainId].scanAddressPath(pool.address)}>
          <Title as="h1">{pool?.name || ''}</Title>
        </StyledExternalLink>
        {pool?.referenceAsset && <StyledChip>{referenceAsset[pool.referenceAsset] ?? pool.referenceAsset}</StyledChip>}
        {pool?.isFactory && <StyledFactoryChip>{t`FACTORY`}</StyledFactoryChip>}
      </AppPageFormTitleWrapper>
    )
  }

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
      {pricesApiPoolData && pricesApi && chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex>
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

      <Wrapper isAdvanceMode chartExpanded={chartExpanded}>
        <AppPageFormsWrapper navHeight={navHeight} className="grid-transfer">
          {!isMdUp && <TitleComp />}
          <AppFormContent variant="primary" shadowed>
            <AppFormHeader
              formTypes={FORM_TYPES}
              activeFormKey={!rFormType ? 'deposit' : (rFormType as string)}
              handleClick={(key: string) => toggleForm(key as TransferFormType)}
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
                      imageBaseUrl={imageBaseUrl}
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
                  hasDepositAndStake={hasDepositAndStake}
                  imageBaseUrl={imageBaseUrl}
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
                  imageBaseUrl={imageBaseUrl}
                  poolAlert={poolAlert}
                  maxSlippage={maxSlippage}
                  seed={seed}
                  tokensMapper={tokensMapper}
                  userPoolBalances={userPoolBalances}
                  userPoolBalancesLoading={userPoolBalancesLoading}
                />
              ) : null}
            </AppFormContentWrapper>
          </AppFormContent>
        </AppPageFormsWrapper>

        <AppPageInfoWrapper>
          {isMdUp && !chartExpanded && <TitleComp />}
          {poolAddress && (
            <Box margin="0 0 var(--spacing-2) 0">
              <CampaignRewardsBanner poolAddress={poolAddress} />
            </Box>
          )}
          {pricesApiPoolData && pricesApi && !chartExpanded && (
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
              !basePoolsLoading && (
                <PoolParameters pricesApi={pricesApi} poolData={poolData} rChainId={rChainId} rPoolId={rPoolId} />
              )}
            {selectedTab === 'gauge' && !!signerAddress && (
              <Suspense fallback={<Loader skeleton={[360, 180]} />}>
                <ManageGauge poolId={poolData!.pool.id} chainId={rChainId} walletAddress={signerAddress} />
              </Suspense>
            )}
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

const StyledChip = styled(Chip)`
  margin-left: var(--spacing-2);
  padding: 0 var(--spacing-1);

  color: black;
  background-color: white;
`

const StyledFactoryChip = styled(StyledChip)`
  background-color: var(--warning-400);
`

const StyledExternalLink = styled(ExternalLink)`
  color: var(--nav--page--color);
  text-transform: none;
`

const Title = styled(TextEllipsis)`
  background-color: rgba(0, 0, 0, 0.8);
  margin: var(--spacing-2) 0;
  font-size: var(--font-size-5);

  @media (max-width: ${breakpoints.xxs}rem) {
    max-width: 7.125rem; // 114px;
  }
`

const StatsWrapper = styled(Box)`
  align-items: flex-start;
  display: grid;

  /* @media (min-width: ${breakpoints.lg}rem) {
    &:not(.loading) {
      grid-template-columns: 1fr 18.75rem;
    }
  } */
`

const PriceAndTradesWrapper = styled(Box)`
  padding: 1.5rem 1rem;
  margin-bottom: var(--spacing-1);
  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: none;
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
