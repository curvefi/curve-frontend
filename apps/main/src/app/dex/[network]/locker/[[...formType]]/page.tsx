import type { Metadata } from 'next'
import type { LockedCrvUrlParams } from '@/dex/types/main.types'
import CrvLocker from '@/dex/components/PageCrvLocker/Page'

type LockedCrvPageProps = { params: Promise<LockedCrvUrlParams> }

export const metadata: Metadata = { title: 'Curve - CRV Locker' }

const CrvLockerPage = async ({ params }: LockedCrvPageProps) => <CrvLocker {...await params} />

export default CrvLockerPage
