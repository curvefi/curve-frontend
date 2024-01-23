import type { DetailInfoTypes, EstimatedGas, Slippage, TransferFormType } from '@/components/PagePool/types'
import type { Seed } from '@/components/PagePool/types'
import type { PageTransferProps } from '@/components/PagePool/types'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { REFRESH_INTERVAL, ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getChainPoolIdActiveKey } from '@/utils'
import { getPath } from '@/utils/utilsRouter'
import { getUserPoolActiveKey } from '@/store/createUserSlice'
import { useNavigate } from 'react-router-dom'
import networks from '@/networks'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import usePoolAlert from '@/hooks/usePoolAlert'
import useTokensMapper from '@/hooks/useTokensMapper'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import AlertBox from '@/ui/AlertBox'
import Box from '@/ui/Box'
import Deposit from '@/components/PagePool/Deposit'
import MySharesStats from '@/components/PagePool/UserDetails'
import PoolStats from '@/components/PagePool/PoolDetails/PoolStats'
import Swap from '@/components/PagePool/Swap'
import Withdraw from '@/components/PagePool/Withdraw'
import Tabs, { Tab, TabContentWrapper } from '@/ui/Tab'
import TextEllipsis from '@/ui/TextEllipsis'
import Button from '@/ui/Button'
import Icon from '@/ui/Icon'
import { ExternalLink } from '@/ui/Link'

import PoolInfoData from '@/components/PagePool/PoolDetails/PoolInfo'
import PoolParameters from '@/components/PagePool/PoolDetails/PoolParameters'
import { props } from 'cypress/types/bluebird'

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

const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolId } = routerParams
  const { chainId, signerAddress } = curve ?? {}
  const navigate = useNavigate()
  const poolAlert = usePoolAlert(poolData?.pool.address, poolData?.hasVyperVulnerability)

  const { tokensMapper } = useTokensMapper(rChainId)
  const userPoolActiveKey = curve && rPoolId ? getUserPoolActiveKey(curve, rPoolId) : ''
  const userPoolBalances = useStore((state) => state.user.walletBalances[userPoolActiveKey])
  const userPoolBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])
  const globalMaxSlippage = useStore((state) => state.maxSlippage)
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

  const [selectedTab, setSelectedTab] = useState<DetailInfoTypes>('pool')
  const [seed, setSeed] = useState(DEFAULT_SEED)

  const { pool } = poolDataCacheOrApi
  const haveSigner = !!signerAddress
  const poolId = poolData?.pool?.id
  const imageBaseUrl = networks[rChainId].imageBaseUrl
  const poolAddress = poolData?.pool.address

  const pricesApi = networks[rChainId].pricesApi
  const pricesApiPoolData = poolData && pricesApiPoolsMapper[poolData.pool.address]

  const DETAIL_INFO_TYPES: { key: DetailInfoTypes; label: string }[] = useMemo(() => {
    return haveSigner
      ? pricesApi &&
        pricesApiPoolData &&
        (poolData?.pool.isCrypto || poolData?.pool.isStableNg) &&
        snapshotsMapper[poolData?.pool.address]
        ? [
            { label: t`Pool Details`, key: 'pool' },
            { label: t`Your Details`, key: 'user' },
            { label: t`Advanced`, key: 'advanced' },
          ]
        : [
            { label: t`Pool Details`, key: 'pool' },
            { label: t`Your Details`, key: 'user' },
          ]
      : pricesApi &&
        pricesApiPoolData &&
        (poolData?.pool.isCrypto || poolData?.pool.isStableNg) &&
        snapshotsMapper[poolData?.pool.address]
      ? [
          { label: t`Pool Details`, key: 'pool' },
          { label: t`Advanced`, key: 'advanced' },
        ]
      : [{ label: t`Pool Details`, key: 'pool' }]
  }, [
    haveSigner,
    poolData?.pool.address,
    poolData?.pool.isCrypto,
    poolData?.pool.isStableNg,
    pricesApi,
    pricesApiPoolData,
    snapshotsMapper,
  ])

  const maxSlippage = useMemo(() => {
    return pool ? (globalMaxSlippage ? globalMaxSlippage : pool?.isCrypto ? '0.1' : '0.03') : ''
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
    if (curve && poolAddress && !snapshotsMapper[poolAddress]) {
      fetchPricesPoolSnapshots(rChainId, poolAddress)
    }
  }, [curve, fetchPricesPoolSnapshots, poolAddress, rChainId, snapshotsMapper])

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
      <TitleWrapper>
        <StyledExternalLink href={networks[rChainId].scanAddressPath(pool.address)}>
          <Title as="h1">{pool?.name || ''}</Title>
        </StyledExternalLink>
        {pool?.referenceAsset && <StyledChip>{referenceAsset[pool.referenceAsset] ?? pool.referenceAsset}</StyledChip>}
        {pool?.isFactory && <StyledFactoryChip>{t`FACTORY`}</StyledFactoryChip>}
      </TitleWrapper>
    )
  }

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
            <PoolInfoData chainId={rChainId} pricesApiPoolData={pricesApiPoolData} routerParams={routerParams} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}
      <TransferPageWrapper>
        <TransferWrapper navHeight={navHeight} chartExpanded={chartExpanded} className="grid-transfer">
          {!isMdUp && <TitleComp />}
          <Box variant="primary" shadowed>
            <Header>
              <Tabs>
                {FORM_TYPES.map(({ key, label }) => (
                  <TransferTab key={key} className={rFormType === key ? 'active' : ''} onClick={() => toggleForm(key)}>
                    {label}
                  </TransferTab>
                ))}
              </Tabs>
            </Header>

            <TransferFormWrapper grid gridRowGap={3} padding>
              {rFormType === 'swap' ? (
                <>
                  {poolAlert?.isDisableSwap ? (
                    <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
                  ) : (
                    <Swap
                      {...pageTransferProps}
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
                  imageBaseUrl={imageBaseUrl}
                  poolAlert={poolAlert}
                  maxSlippage={maxSlippage}
                  seed={seed}
                  tokensMapper={tokensMapper}
                  userPoolBalances={userPoolBalances}
                  userPoolBalancesLoading={userPoolBalancesLoading}
                />
              ) : null}
            </TransferFormWrapper>
          </Box>
        </TransferWrapper>

        <PoolInfoWrapper>
          {isMdUp && !chartExpanded && <TitleComp />}
          {pricesApiPoolData && pricesApi && !chartExpanded && (
            <PriceAndTradesWrapper variant="secondary">
              <PoolInfoData chainId={rChainId} pricesApiPoolData={pricesApiPoolData} routerParams={routerParams} />
            </PriceAndTradesWrapper>
          )}
          <DetailTabsWrapper>
            <Tabs>
              {DETAIL_INFO_TYPES.map(({ key, label }) => (
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
          </DetailTabsWrapper>
          <DetailContentWrapper>
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
            {selectedTab === 'advanced' && poolData && snapshotsMapper[poolData.pool.address] !== undefined && (
              <PoolParameters pricesApi={pricesApi} poolData={poolData} rChainId={rChainId} rPoolId={rPoolId} />
            )}
          </DetailContentWrapper>
        </PoolInfoWrapper>
      </TransferPageWrapper>
    </>
  )
}

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

const TitleWrapper = styled.header`
  align-items: center;
  display: inline-flex;
  padding-left: 1rem;
  min-height: 46px;
  color: var(--nav--page--color);
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

const PoolInfoWrapper = styled(Box)`
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    padding: 1.5rem;
  }
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

const TransferFormWrapper = styled(TabContentWrapper)`
  padding-top: 1rem;
`

const TransferWrapper = styled(Box)<{ navHeight: number; chartExpanded: boolean }>`
  padding-top: 1.5rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-bottom: var(--spacing-3);
    ${(props) => (props.chartExpanded ? 'padding-top: 1.5rem' : 'padding-top: 2rem')}
  }

  @media (min-width: ${breakpoints.md}rem) {
    max-width: 22.3125rem;
    min-width: var(--transfer-min-width);
    padding-right: 0;
    padding-left: 1.5rem;
    //position: sticky;
    top: ${({ navHeight }) => `${navHeight}px;`};
  }
`

const TransferPageWrapper = styled(Box)`
  display: grid;

  @media (min-width: ${breakpoints.sm}rem) {
    padding: 0 var(--spacing-3);
  }

  @media (min-width: ${breakpoints.md}rem) {
    display: flex;
    align-items: flex-start;
    padding: 0;
  }
`

const TransferTab = styled(Tab)`
  max-width: 9rem; //144px;
`

const PriceAndTradesWrapper = styled(Box)`
  padding: 1.5rem 1rem;
  margin-bottom: var(--spacing-1);
  margin-top: var(--spacing-1);
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

const DetailTabsWrapper = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

const DetailContentWrapper = styled(TabContentWrapper)`
  min-height: 14.6875rem; // 235px
  position: relative;
`

export default Transfer
