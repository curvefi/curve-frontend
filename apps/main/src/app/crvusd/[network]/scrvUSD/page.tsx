import type { Metadata } from 'next'
import CrvStaking from '@/loan/components/PageCrvUsdStaking/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'

type CrvStakingPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Savings crvUSD - Curve' }

const CrvStakingPage = async ({ params }: CrvStakingPageProps) => <CrvStaking {...await params} />

export default CrvStakingPage
