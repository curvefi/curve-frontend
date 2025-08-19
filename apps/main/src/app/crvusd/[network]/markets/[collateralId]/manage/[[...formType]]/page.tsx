import ManageLoan from '@/loan/components/PageLoanManage/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  return <ManageLoan {...useParams<CollateralUrlParams>()} />
}
