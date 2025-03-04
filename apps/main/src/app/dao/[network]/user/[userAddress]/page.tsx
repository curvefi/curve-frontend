import type { Metadata } from 'next'
import type { UserUrlParams } from '@/dao/types/dao.types'
import PageUser from '@/dao/components/PageUser/Page'
import { t } from '@ui-kit/lib/i18n'

type UserPageProps = { params: Promise<UserUrlParams> }

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { userAddress } = await params
  return { title: [t`veCRV Holder`, userAddress, 'Curve'].join(' - ') }
}

const UserPage = async ({ params }: UserPageProps) => <PageUser {...await params} />

export default UserPage
