import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Address, isAddressEqual } from 'viem'
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
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { ManageGauge } from '@/dex/widgets/manage-gauge'
import type { Chain } from '@curvefi/prices-api'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as TanstackLink } from '@tanstack/react-router'
import { AlertBox } from '@ui/AlertBox'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { FormMargins } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { PoolAlertBanner } from '../PoolAlertBanner'

const { Spacing } = SizesAndSpaces

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

/** Prices API tells us which pools methods are available, of which the following one is a requisite for refuels */
const hasRefuelMethod = (poolMethods?: string[]) => poolMethods?.includes('donation_shares')

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params, curve, hasDepositAndStake, poolData, poolDataCacheOrApi, routerParams } = pageTransferProps
  const { rChainId, rFormType, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const { signerAddress } = curve ?? {}
  const push = useNavigate()
  const poolAlert = usePoolAlert(poolData)
  const { tokensMapper } = useTokensMapper(rChainId)
  const chainIdPoolId = getChainPoolIdActiveKey(rChainId, poolId)
  const currencyReserves = useStore(state => state.pools.currencyReserves[chainIdPoolId])
  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  const setPoolIsWrapped = useStore(state => state.pools.setPoolIsWrapped)
  const { pool } = poolDataCacheOrApi

  const poolMaxSlippage = useUserProfileStore(state => state.maxSlippage[chainIdPoolId])
  const poolTypeMaxSlippage = useUserProfileStore(state => state.maxSlippage[pool.isCrypto ? 'crypto' : 'stable'])

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
    const poolTypeDefaultMaxSlippage = pool.isCrypto ? '0.1' : '0.03'
    return poolMaxSlippage || poolTypeMaxSlippage || poolTypeDefaultMaxSlippage
  }, [pool.isCrypto, poolMaxSlippage, poolTypeMaxSlippage])

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
          <Typography variant="headingSBold" sx={{ paddingBlock: Spacing.sm }}>
            {pool.name || ''}
          </Typography>
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
        {poolAddress && <CampaignRewardsBanner chainId={rChainId} address={poolAddress} />}
        {!isLite && pricesApiPoolData && pricesApi && (
          <OhlcAndActivityComp rChainId={rChainId} poolAddress={poolAddress} pricesApiPoolData={pricesApiPoolData} />
        )}
        <Stack>
          <Stack direction="row">
            <TabsSwitcher
              variant="contained"
              value={poolInfoTab}
              onChange={setPoolInfoTab}
              options={poolInfoTabs}
              testIdPrefix="pool-info-tab"
            />
            {hasRefuelMethod(pricesApiPoolData?.poolMethods) && (
              <Button
                component={TanstackLink}
                to={getPath(params, `${ROUTE.PAGE_POOLS}/${poolAddress}/refuel`)}
                variant="inline"
                color="ghost"
                sx={{ whiteSpace: 'nowrap', alignSelf: 'end', marginBlockEnd: Spacing.xs }}
              >
                {t`Manage pool`}
              </Button>
            )}
          </Stack>
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
            <PoolStats
              routerParams={routerParams}
              poolData={poolData}
              poolDataCacheOrApi={poolDataCacheOrApi}
              poolAlert={poolAlert}
              tokensMapper={tokensMapper}
            />
          )}
          {poolInfoTab === 'advanced' && poolData && <PoolParameters poolData={poolData} rChainId={rChainId} />}
        </Stack>
      </DetailPageLayout>
    </>
  )
}
