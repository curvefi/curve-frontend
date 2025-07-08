import LoanCreate from '@/lend/components/PageLoanCreate/Page'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams<MarketUrlParams>()
  return <LoanCreate {...params} />
}
