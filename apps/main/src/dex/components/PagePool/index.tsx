import { useEffect, useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { useShallow } from 'zustand/react/shallow'
import { OhlcAndActivityComp } from '@/dex/components/OhlcAndActivityComp'
import { CampaignRewardsBanner } from '@/dex/components/PagePool/components/CampaignRewardsBanner'
import { TabGuard } from '@/dex/components/PagePool/components/TabGuard'
import { FormDepositStake } from '@/dex/components/PagePool/Deposit/components/FormDepositStake'
import { FormStake } from '@/dex/components/PagePool/Deposit/components/FormStake'
import { LegacyFormDeposit } from '@/dex/components/PagePool/Deposit/components/LegacyFormDeposit'
import { PoolAdvancedDetails } from '@/dex/components/PagePool/PoolAdvancedDetails'
import { Swap } from '@/dex/components/PagePool/Swap'
import type { PageTransferProps, Seed, TransferProps, TransferTabsParams } from '@/dex/components/PagePool/types'
import {
  getDepositTabAlert,
  getSlippageType,
  getSwapTabAlert,
  getWithdrawTabAlert,
} from '@/dex/components/PagePool/utils'
import { FormClaim } from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import { FormUnstake } from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import { FormWithdraw as LegacyFormWithdraw } from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import { useGaugeManager, useGaugeRewardsDistributors } from '@/dex/entities/gauge/model/gauge.query'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token/ui/AddRewardToken'
import { DepositTab } from '@/dex/features/deposit/components/DepositTab'
import { DepositReward } from '@/dex/features/deposit-gauge-reward/ui/DepositReward'
import { usePoolContext } from '@/dex/features/pool-context'
import { PoolInformation } from '@/dex/features/pool-information'
import { PoolHistoricalBaseRateChart } from '@/dex/features/PoolHistoricalBaseRateChart'
import { UserPosition } from '@/dex/features/user-position'
import { WithdrawTab } from '@/dex/features/withdraw/components/WithdrawTab'
import { usePoolAlert } from '@/dex/hooks/usePoolAlert'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { PoolPageHeader } from '@/dex/widgets/page-header/PoolPageHeader'
import type { Chain } from '@curvefi/prices-api'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useNewPoolForms } from '@evm-ui/hooks/useFeatureFlags'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { zip } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import { type FormTab, FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, fallbackQ, mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { useLocation } from '@ui/hooks/router'
import { usePreviousValue } from '@ui/hooks/usePreviousValue'
import { t } from '@ui/lib/i18n'
import { PoolAlertBanner } from '../PoolAlertBanner'

const DEFAULT_SEED: Seed = { isSeed: null, loaded: false }

const FormDeposit = (props: TransferProps) =>
  useNewPoolForms() ? <DepositTab {...props} /> : <LegacyFormDeposit {...props} />

const FormWithdraw = (props: TransferProps) => {
  const { pool } = usePoolContext()
  // Custom amounts use withdrawImbalance, which crypto pools don’t support.
  return useNewPoolForms() && pool.data?.isCrypto === false ? (
    <WithdrawTab {...props} />
  ) : (
    <LegacyFormWithdraw {...props} />
  )
}

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
        component: props => <TabGuard alert={getDepositTabAlert} otherwise={FormStake} {...props} />,
      },
      {
        value: 'DEPOSIT_STAKE',
        label: t`Deposit & Stake`,
        component: props => <TabGuard alert={getDepositTabAlert} otherwise={FormDepositStake} {...props} />,
      },
    ],
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    subTabs: [
      {
        value: 'WITHDRAW',
        label: t`Withdraw`,
        component: props => <TabGuard alert={getWithdrawTabAlert} otherwise={FormWithdraw} {...props} />,
      },
      { value: 'UNSTAKE', label: t`Unstake`, component: FormUnstake },
      { value: 'CLAIM', label: t`Claim Rewards`, component: FormClaim },
    ],
  },
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
        component: () => <AddRewardToken />,
      },
      {
        value: 'deposit_reward',
        label: t`Deposit Reward`,
        visible: p => !!p.isRewardsDistributor,
        component: () => <DepositReward />,
      },
    ],
  },
] as const satisfies FormTab<TransferTabsParams>[]

/** Replaces old form-specific pool URLs for expanded-row links that should open a specific form tab. */
type PoolRouteState = { defaultTab?: (typeof menu)[number]['value'] }

export const Transfer = (pageTransferProps: PageTransferProps) => {
  const { params } = pageTransferProps
  const {
    chainId,
    blockchainId,
    poolAddress,
    pool,
    api: curve,
    isWrapped,
    setIsWrapped,
    tokens,
    tokenAddresses,
  } = usePoolContext()

  const poolAlert = usePoolAlert({
    blockchainId,
    poolAddress,
    hasVyperVulnerability: pool.data?.hasVyperVulnerability(),
  })
  const maxSlippage = useUserProfileStore(state => state.maxSlippage[getSlippageType(pool.data) ?? 'stable'])

  const { state } = useLocation()
  const defaultTab = (state as PoolRouteState).defaultTab

  const currencyReserves = usePoolCurrencyReserves({ chainId, poolAddress, isWrapped })
  const pricesApiPoolData = usePoolPricesApi({ blockchainId: blockchainId as Chain, poolAddress })

  const currentSeed = mapQuery(
    fallbackQ(
      mapQuery(currencyReserves, reserves => reserves.tokens.map(({ balance }) => +balance)),
      mapQuery(pricesApiPoolData, pool => pool.balances),
    ),
    // Need useShallow as mapQuery creates a new object every render, causing infinite rerenders in combination with usePreviousValue.
    // Less complex than using useMappedQuery upstream for the fallback queries.
    useShallow((balances: number[] | undefined) =>
      balances?.length ? { isSeed: balances.every(balance => balance === 0), loaded: true } : null,
    ),
  )

  // Keep the last loaded status while reserve data is temporarily unavailable, including wrapped-mode changes.
  const seed = usePreviousValue(currentSeed.data) ?? DEFAULT_SEED

  useEffect(() => {
    if (currentSeed.data?.isSeed && hasWrapped(pool.data)) setIsWrapped(true)
  }, [currentSeed.data, pool.data, setIsWrapped])

  const { signerAddress } = curve ?? {}
  const { data: gaugeManager } = useGaugeManager({ chainId, poolAddress })
  const { data: rewardDistributors } = useGaugeRewardsDistributors({ chainId, poolAddress, userAddress: signerAddress })

  const tabParams = useMemo(
    () => ({
      params,
      poolAlert,
      maxSlippage,
      seed,
      isGaugeManager: !!(gaugeManager && signerAddress && isAddressEqual(gaugeManager, signerAddress)),
      isRewardsDistributor: maybes([rewardDistributors, signerAddress], (rewardDistributors, signerAddress) =>
        Object.values(rewardDistributors).some(distributorId => isAddressEqual(distributorId, signerAddress)),
      ),
    }),
    [params, poolAlert, maxSlippage, seed, gaugeManager, signerAddress, rewardDistributors],
  )

  return (
    <>
      {poolAlert?.banner && (
        <PoolAlertBanner
          alertType={poolAlert.alertType}
          banner={poolAlert.banner}
          network={blockchainId}
          poolAddress={poolAddress}
        />
      )}
      <DetailPageLayout
        header={
          <PoolPageHeader
            chainId={chainId}
            blockchainId={blockchainId}
            poolAddress={poolAddress}
            // for now the page only renders when pool data has already loaded, it's not lazy yet.
            title={mapQuery(pool, pool => pool.name)}
            tokens={
              combineQueries([tokens, tokenAddresses], (tokens, tokenAddresses) =>
                zip(tokens, tokenAddresses)
                  .filter(([, address]) => address)
                  .map(([symbol, address]) => constQ({ symbol, address })),
              ).data
            }
            pricesApiPoolData={pricesApiPoolData}
            backHref={getInternalUrl('dex', blockchainId, DEX_ROUTES.PAGE_POOLS)}
          />
        }
        formTabs={{ content: tabParams && <FormTabs menu={menu} params={tabParams} defaultValue={defaultTab} /> }}
      >
        <CampaignRewardsBanner />
        <UserPosition />
        {!isLiteChain(chainId) && pricesApiPoolData.data && (
          <OhlcAndActivityComp chainId={chainId} pricesApiPoolData={pricesApiPoolData.data} />
        )}
        {!isLiteChain(chainId) && <PoolHistoricalBaseRateChart blockchainId={blockchainId} poolAddress={poolAddress} />}
        <PoolInformation poolAlert={poolAlert} pricesApiPoolData={pricesApiPoolData} />
        <PoolAdvancedDetails />
      </DetailPageLayout>
    </>
  )
}
