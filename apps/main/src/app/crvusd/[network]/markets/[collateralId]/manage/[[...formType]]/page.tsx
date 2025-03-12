import type { Metadata } from 'next'
import { getCollateralName } from '@/app/crvusd/[network]/markets/[collateralId]/collateral.utils'
import ManageLoan from '@/loan/components/PageLoanManage/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

type CreateLoanPageProps = { params: Promise<CollateralUrlParams> }

export async function generateMetadata({ params }: CreateLoanPageProps): Promise<Metadata> {
  const collateralName = getCollateralName(await params)
  return { title: [t`Manage`, await collateralName, 'Curve'].join(' - ') }
}

const CreateLoanPage = async ({ params }: CreateLoanPageProps) => <ManageLoan {...await params} />

export default CreateLoanPage
