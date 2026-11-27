import { PoolCampaigns } from '@/stellar/features/campaigns/PoolCampaigns'
import { asAddress, asStellarContract, shortenAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { AdvancedWithdrawTab } from '@/stellar/features/withdraw/AdvancedWithdrawTab'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenName } from '@/stellar/queries/token/token-name.query'
import Alert from '@mui/material/Alert'
import type { RouterState } from '@ui/components/RouterLink'
import { AlertDisableForm } from '@ui/features/forms/AlertDisableForm'
import { type FormTab, FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { PageState } from '@ui/features/layout/PageState'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { useLocation, useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { StellarPages } from '../../routes/routes'
import { DepositTab } from '../deposit/DepositTab'
import { SwapTab } from '../swap/SwapTab'
import { OneCoinWithdrawTab } from '../withdraw/OneCoinWithdrawTab'
import { PoolAdvancedDetails } from './PoolAdvancedDetails'
import { useIsRegisteredPool } from './useIsRegisteredPool'
import { useLitePool } from './useLitePool'
import { usePoolComposition } from './usePoolComposition'
import { usePoolTokens } from './usePoolTokens'
import { UserPosition } from './UserPosition'

const menu = [
  {
    value: 'seed-pool',
    label: t`Seed pool`,
    visible: ({ isSeed }) => isSeed === true,
    component: props => <DepositTab {...props} type="advanced" />,
  },
  {
    value: 'deposit',
    label: t`Deposit`,
    visible: ({ isSeed }) => !isSeed,
    subTabs: [
      { value: 'deposit-one-coin', label: t`One coin`, component: props => <DepositTab {...props} type="one-coin" /> },
      { value: 'deposit-advanced', label: t`Advanced`, component: props => <DepositTab {...props} type="advanced" /> },
    ],
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    visible: ({ isSeed }) => !isSeed,
    subTabs: [
      { value: 'withdraw-one-coin', label: t`One coin`, component: OneCoinWithdrawTab },
      { value: 'withdraw-advanced', label: t`Advanced`, component: AdvancedWithdrawTab },
    ],
  },
  { value: 'swap', label: t`Swap`, component: SwapTab, visible: ({ isSeed }) => !isSeed },
] as const satisfies FormTab<PoolQuery & { isSeed: boolean | undefined }>[]

export const PoolPage = () => {
  const { network, pool } = useParams<PoolQuery>()
  const { defaultTab } = useLocation().state as RouterState
  const { address: account } = useWallet()
  const params = { network, pool }
  const config = usePoolConfig(params)
  const supply = usePoolSupply(params)
  const { query: litePool } = useLitePool(params)
  const registration = useIsRegisteredPool(params, config, litePool)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, symbols, decimals } = usePoolTokens({ network, account, tokenAddresses }) ?? {}
  const composition = usePoolComposition({ ...params, tokenAddresses, symbols, decimals, litePool })
  const tokenName = useTokenName({ network, token: pool })
  const form = combineQueries([config, supply], (_, supply) => ({ ...params, isSeed: !+supply }))

  return (
    <PageState
      query={registration}
      notFound={t`Pool Not Found`}
      continueUrl={StellarPages.pools({ network })}
      userAddress={asAddress(account)}
    >
      <DetailPageLayout
        header={
          <PoolDetailsHeader
            backHref={StellarPages.pools({ network })}
            title={fallbackQ(
              q(tokenName),
              mapQuery(litePool, pool => pool?.name ?? pool?.symbol ?? undefined),
            )}
            tokens={fallbackQ(
              combineQueries([tokenAddresses, ...(tokens ?? [])], (_, ...tokens) => tokens),
              mapQuery(litePool, pool =>
                pool?.coins?.map(({ address, symbol }) => ({
                  address,
                  symbol: symbol || shortenAddress(asStellarContract(address)),
                })),
              ),
            )}
            blockchainId={network}
            rightItems={<PoolHeaderMetrics tvl={composition.totalUsd} />}
          />
        }
        formTabs={{
          placement: 'inline',
          content: form.data ? (
            <FormTabs menu={menu} params={form.data} defaultValue={defaultTab?.toString()} />
          ) : (
            form.error && <AlertDisableForm>{form.error.message}</AlertDisableForm>
          ),
        }}
      >
        {!litePool.data && (
          <Alert severity={litePool.isLoading ? 'info' : 'warning'} data-testid="pool-unlisted-warning">
            {litePool.isLoading
              ? t`Pool data is still loading. Some information is not available yet.`
              : t`Some pool data is unavailable from the API.`}
          </Alert>
        )}
        <UserPosition {...params} litePool={litePool} totalUsd={composition.totalUsd} />
        <PoolCampaigns {...params} />
        <PoolCompositionCard {...composition} />
        <PoolAdvancedDetails network={network} pool={pool} tokens={tokens} litePool={litePool} />
      </DetailPageLayout>
    </PageState>
  )
}
