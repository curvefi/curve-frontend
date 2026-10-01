import { networks } from '@/lend/networks'
import { BorrowClaimForm } from '@/llamalend/features/borrow/components/BorrowClaimForm'
import type { FormTab } from '@ui/features/forms/tabs/FormTabs'
import { t } from '@ui/lib/i18n'

export type BorrowTabsClaimVisibility = { showCollateralClaim: boolean }

export const borrowClaimTab = {
  value: 'claim',
  label: t`Claim`,
  visible: props => props.showCollateralClaim,
  component: () => <BorrowClaimForm networks={networks} />,
} satisfies FormTab<BorrowTabsClaimVisibility>
