import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { useTokenName } from '@/stellar/queries/token/token-name.query'
import { FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { mapQuery, q } from '@ui/features/queries/util'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { StellarUrls } from '../../routes/routes'
import { DepositTab } from '../deposit/DepositTab'
import { SwapTab } from '../swap/SwapTab'
import { WithdrawTab } from '../withdraw/WithdrawTab'
import { usePoolComposition } from './usePoolComposition'
import { usePoolTokens } from './usePoolTokens'

const menu = [
  { value: 'deposit', label: t`Deposit`, component: DepositTab },
  { value: 'withdraw', label: t`Withdraw`, component: WithdrawTab },
  { value: 'swap', label: t`Swap`, component: SwapTab },
]

export const PoolPage = () => {
  const { network, pool } = useParams<PoolQuery>()
  const { address: account } = useWallet()
  const params = { network, pool }
  const config = usePoolConfig(params)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, decimals } = usePoolTokens({ network, account, tokenAddresses })
  const composition = usePoolComposition({ ...params, tokenAddresses, tokens, decimals })

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
      formTabs={{ placement: 'inline', content: <FormTabs menu={menu} params={{ network, pool }} /> }}
    >
      <PoolCompositionCard {...composition} />
    </DetailPageLayout>
  )
}
