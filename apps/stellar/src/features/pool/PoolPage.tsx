import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { DepositTab } from '../deposit/DepositTab'
import { SwapTab } from '../swap/SwapTab'
import { WithdrawTab } from '../withdraw/WithdrawTab'

const menu = [
  { value: 'deposit', label: t`Deposit`, component: DepositTab },
  { value: 'withdraw', label: t`Withdraw`, component: WithdrawTab },
  { value: 'swap', label: t`Swap`, component: SwapTab },
]

export const PoolPage = () => {
  const { network, pool } = useParams<{ network: StellarNetwork; pool: StellarContract }>()
  return (
    <DetailPageLayout
      formTabs={{ placement: 'inline', content: <FormTabs menu={menu} params={{ network, pool }} /> }}
    />
  )
}
