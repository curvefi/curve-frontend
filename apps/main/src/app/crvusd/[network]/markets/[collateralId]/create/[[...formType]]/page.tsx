import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import type { Route } from './+types/page'

export default function Component({ params }: Route.ComponentProps) {
  const collateralParams: CollateralUrlParams = {
    network: params.network,
    collateralId: params.collateralId,
    formType: params.formType,
  }

  return <CreateLoan {...collateralParams} />
}
