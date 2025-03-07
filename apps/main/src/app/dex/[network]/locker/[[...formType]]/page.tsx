import type { Metadata } from 'next'
import type { CrvLockerUrlParams } from '@/dex/types/main.types'
import CrvLocker from '@/dex/components/PageCrvLocker/Page'

type CrvLockerPageProps = { params: Promise<CrvLockerUrlParams> }

export const metadata: Metadata = { title: 'CRV Locker - Curve' }

const CrvLockerPage = async ({ params }: CrvLockerPageProps) => <CrvLocker {...await params} />

export default CrvLockerPage
