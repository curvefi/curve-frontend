import type { Metadata, ResolvingMetadata } from 'next'
import { t } from '@ui-kit/lib/i18n'
import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'

type CreateLoanPageProps = { params: Promise<CollateralUrlParams> }

export async function generateMetadata(
  { params }: CreateLoanPageProps,
  parentMetadata: ResolvingMetadata,
): Promise<Metadata> {
  const [{ collateralId }, { title: parentTitle }] = await Promise.all([params, parentMetadata])
  // todo: convert collateralId to collateral name
  return { title: [t`Create`, collateralId, 'Curve'].join(' - ') }
}

const CreateLoanPage = async ({ params }: CreateLoanPageProps) => <CreateLoan {...await params} />

export default CreateLoanPage
