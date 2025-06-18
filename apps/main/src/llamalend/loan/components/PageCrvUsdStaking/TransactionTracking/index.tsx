import useStore from '@/loan/store/useStore'
import DepositTracking from './DepositTracking'
import WithdrawTracking from './WithdrawTracking'

type TransactionTrackingProps = {
  className?: string
  approved?: boolean
}

const components = { deposit: DepositTracking, withdraw: WithdrawTracking }

const TransactionTracking = ({ className }: TransactionTrackingProps) => {
  const { stakingModule } = useStore((state) => state.scrvusd)
  const Component = components[stakingModule]
  return <Component className={className} />
}

export default TransactionTracking
