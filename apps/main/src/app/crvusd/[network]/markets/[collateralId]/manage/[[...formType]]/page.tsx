import type { Metadata, ResolvingMetadata } from 'next'
import { t } from '@ui-kit/lib/i18n'
import ManageLoan from '@/loan/components/PageLoanManage/Page'
import type { CollateralUrlParams } from '@/loan/types/loan.types'

type CreateLoanPageProps = { params: Promise<CollateralUrlParams> }

export async function generateMetadata(_: CreateLoanPageProps, parentMetadata: ResolvingMetadata): Promise<Metadata> {
  const { title: parentTitle } = await parentMetadata
  return { title: [t`Create`, parentTitle].join(' - ') }
}

const CreateLoanPage = async ({ params }: CreateLoanPageProps) => <ManageLoan {...await params} />

export default CreateLoanPage
