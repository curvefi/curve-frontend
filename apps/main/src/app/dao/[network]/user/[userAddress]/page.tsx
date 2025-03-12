import type { Metadata } from 'next'
import { getAddress } from 'viem'
import PageUser from '@/dao/components/PageUser/Page'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { t } from '@ui-kit/lib/i18n'

type UserPageProps = { params: Promise<UserUrlParams> }

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { userAddress } = await params
  return { title: [t`veCRV Holder`, getAddress(userAddress), 'Curve'].join(' - ') }
}

const UserPage = async ({ params }: UserPageProps) => <PageUser {...await params} />

export default UserPage
