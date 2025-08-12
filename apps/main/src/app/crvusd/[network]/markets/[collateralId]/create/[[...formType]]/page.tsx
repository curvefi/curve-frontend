import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  return <CreateLoan {...useParams<CollateralUrlParams>()} />
}
