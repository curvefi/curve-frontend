import useStore from '@/store/useStore'

import DepositTracking from './DepositTracking'
import WithdrawTracking from './WithdrawTracking'

type TransactionTrackingProps = {
  className?: string
  approved?: boolean
}

const TransactionTracking = ({ className }: TransactionTrackingProps) => {
  const { stakingModule } = useStore((state) => state.scrvusd)

  return (
    <>
      {stakingModule === 'deposit' && <DepositTracking className={className} />}
      {stakingModule === 'withdraw' && <WithdrawTracking className={className} />}
    </>
  )
}

export default TransactionTracking
