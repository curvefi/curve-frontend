import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { t } from '@ui/lib/i18n'
import { ScrvUsdDepositForm } from '../ScrvUsdDepositForm'
import { ScrvUsdWithdrawForm } from '../ScrvUsdWithdrawForm'

const ScrvUsdMenu = [
  { value: 'deposit', label: t`Deposit`, component: ScrvUsdDepositForm },
  { value: 'withdraw', label: t`Withdraw`, component: ScrvUsdWithdrawForm },
  {
    value: 'swap',
    label: t`Swap`,
    href: ({ network }: NetworkUrlParams) =>
      `${getInternalUrl('dex', network, DEX_ROUTES.PAGE_SWAP)}?from=${CRVUSD_ADDRESS}&to=${SCRVUSD_VAULT_ADDRESS}`,
  },
] satisfies FormTab<NetworkUrlParams>[]

export const DepositWithdraw = ({ params }: { params: NetworkUrlParams }) => (
  <FormTabs params={params} menu={ScrvUsdMenu} />
)
