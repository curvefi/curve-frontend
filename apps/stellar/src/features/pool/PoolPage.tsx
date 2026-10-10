import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenName } from '@/stellar/queries/token/token-name.query'
import type { RouterState } from '@ui/components/RouterLink'
import { FormTabs } from '@ui/features/forms/tabs/FormTabs'
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
import { WithdrawTab } from '../withdraw/WithdrawTab'
import { PoolAdvancedDetails } from './PoolAdvancedDetails'
import { usePoolComposition } from './usePoolComposition'
import { usePoolTokens } from './usePoolTokens'

const menu = [
  { value: 'deposit', label: t`Deposit`, component: DepositTab },
  { value: 'withdraw', label: t`Withdraw`, component: WithdrawTab },
  { value: 'swap', label: t`Swap`, component: SwapTab },
]

export const PoolPage = () => {
  const { network, pool } = useParams<PoolQuery>()
  const { defaultTab } = useLocation().state as RouterState
  const { address: account } = useWallet()
  const params = { network, pool }
  const config = usePoolConfig(params)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, symbols, decimals } = usePoolTokens({ network, account, tokenAddresses }) ?? {}
  const composition = usePoolComposition({ ...params, tokenAddresses, symbols, decimals })

  return (
    <DetailPageLayout
      header={
        <PoolDetailsHeader
          backHref={StellarUrls.poolList({ network })}
          title={q(useTokenName({ network, token: pool }))}
          tokens={tokens}
          blockchainId={network}
          rightItems={<PoolHeaderMetrics tvl={composition.totalUsd} />}
        />
      }
      formTabs={{
        placement: 'inline',
        content: <FormTabs menu={menu} params={{ network, pool }} defaultValue={defaultTab?.toString()} />,
      }}
    >
      <PoolCompositionCard {...composition} />
      <PoolAdvancedDetails network={network} pool={pool} tokens={tokens} />
    </DetailPageLayout>
  )
}
