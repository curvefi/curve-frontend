import type { Metadata } from 'next'
import { getCollateralName } from '@/app/crvusd/[network]/markets/[collateralId]/collateral.utils'
import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

type CreateLoanPageProps = { params: Promise<CollateralUrlParams> }

export async function generateMetadata({ params }: CreateLoanPageProps): Promise<Metadata> {
  const collateralName = await getCollateralName(await params)
  return { title: [t`Create`, collateralName, 'Curve'].join(' - ') }
}

const CreateLoanPage = async ({ params }: CreateLoanPageProps) => <CreateLoan {...await params} />

export default CreateLoanPage
