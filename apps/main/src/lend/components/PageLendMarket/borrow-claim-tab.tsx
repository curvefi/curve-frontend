import { networks } from '@/lend/networks'
import { BorrowClaimTab } from '@/llamalend/features/borrow/components/BorrowClaimTab'
import type { BorrowTabsClaimVisibility } from '@/llamalend/features/borrow/types'
import type { FormTab } from '@ui/features/forms/tabs/FormTabs'
import { t } from '@ui/lib/i18n'

export const borrowClaimTab = {
  value: 'claim',
  label: t`Claim`,
  visible: props => props.showCollateralClaim,
  omitFormButton: true,
  component: () => <BorrowClaimTab networks={networks} />,
} satisfies FormTab<BorrowTabsClaimVisibility>
