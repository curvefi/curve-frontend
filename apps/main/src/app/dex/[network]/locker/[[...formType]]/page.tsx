import type { Metadata } from 'next'
import { PageCrvLocker } from '@/dex/components/PageCrvLocker/Page'
import type { CrvLockerUrlParams } from '@/dex/types/main.types'

type CrvLockerPageProps = { params: Promise<CrvLockerUrlParams> }

export const metadata: Metadata = { title: 'CRV Locker - Curve' }

const CrvLockerPage = async ({ params }: CrvLockerPageProps) => <PageCrvLocker {...await params} />

export default CrvLockerPage
