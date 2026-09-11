import type { StellarAddress } from '@/features/connect-wallet/address'
import type { StellarNetwork } from '@/lib/networks'
import { FormTabs } from '@ui/features/forms/tabs/FormTabs'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { DepositTab } from './DepositTab'

const menu = [{ value: 'deposit', label: t`Deposit`, component: DepositTab }]

export const PoolPage = () => {
  const { network, pool } = useParams<{ network: StellarNetwork; pool: StellarAddress }>()
  return (
    <DetailPageLayout
      formTabs={{ placement: 'inline', content: <FormTabs menu={menu} params={{ network, pool }} /> }}
    />
  )
}
