import type { Metadata } from 'next'
import type { CrvLockerUrlParams } from '@/dex/types/main.types'
import CrvLocker from '@/dex/components/PageCrvLocker/Page'

type LockedCrvPageProps = { params: Promise<CrvLockerUrlParams> }

export const metadata: Metadata = { title: 'Curve - CRV Locker' }

const CrvLockerPage = async ({ params }: LockedCrvPageProps) => <CrvLocker {...await params} />

export default CrvLockerPage
