import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
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
