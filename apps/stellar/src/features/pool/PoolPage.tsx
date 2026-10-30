import { StellarErrorPage } from '@/stellar/components/StellarErrorPage'
import { PoolCampaigns } from '@/stellar/features/campaigns/PoolCampaigns'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { AdvancedWithdrawTab } from '@/stellar/features/withdraw/AdvancedWithdrawTab'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenName } from '@/stellar/queries/token/token-name.query'
import { Loading } from '@ui/components/Loading'
import type { RouterState } from '@ui/components/RouterLink'
import { AlertDisableForm } from '@ui/features/forms/AlertDisableForm'
import { type FormTab, FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { mapQuery, q } from '@ui/features/queries/util'
import { useLocation, useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { StellarUrls } from '../../routes/routes'
import { DepositTab } from '../deposit/DepositTab'
import { SwapTab } from '../swap/SwapTab'
import { OneCoinWithdrawTab } from '../withdraw/OneCoinWithdrawTab'
import { PoolAdvancedDetails } from './PoolAdvancedDetails'
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
  const { query: litePool, isMissing } = useLitePool(params)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, symbols, decimals } = usePoolTokens({ network, account, tokenAddresses }) ?? {}
  const composition = usePoolComposition({ ...params, tokenAddresses, symbols, decimals })
  const tokenName = useTokenName({ network, token: pool })

  return litePool.data ? (
    <DetailPageLayout
      header={
        <PoolDetailsHeader
          backHref={StellarUrls.poolList({ network })}
          title={q(tokenName)}
          tokens={tokens}
          blockchainId={network}
          rightItems={<PoolHeaderMetrics tvl={composition.totalUsd} />}
        />
      }
      formTabs={{
        placement: 'inline',
        content:
          supply.data == null ? (
            supply.error && <AlertDisableForm>{supply.error.message}</AlertDisableForm>
          ) : (
            <FormTabs menu={menu} params={{ ...params, isSeed: !+supply.data }} defaultValue={defaultTab?.toString()} />
          ),
      }}
    >
      <UserPosition {...params} litePool={litePool} totalUsd={composition.totalUsd} />
      <PoolCampaigns {...params} />
      <PoolCompositionCard {...composition} />
      <PoolAdvancedDetails network={network} pool={pool} tokens={tokens} litePool={litePool} />
    </DetailPageLayout>
  ) : isMissing || litePool.error ? (
    <StellarErrorPage
      title={litePool.error ? t`Error` : '404'}
      subtitle={litePool.error?.message ?? t`Pool Not Found`}
      error={litePool.error}
      continueUrl={StellarUrls.poolList({ network })}
    />
  ) : (
    <Loading />
  )
}
