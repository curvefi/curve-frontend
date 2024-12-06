import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

const CellLoanUserHealth = ({ userActiveKey }: { userActiveKey: string }) => {
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const userLoanHealthResp = useStore((state) => state.user.loansHealthsMapper[userActiveKey])

  const { loanExists, error: loanExistsError } = loanExistsResp ?? {}
  const { healthFull, error: userLoanDetailsError } = userLoanHealthResp ?? {}

  return (
    <>
      {typeof loanExistsResp === 'undefined'
        ? null
        : loanExistsError || (loanExists && userLoanDetailsError)
          ? '?'
          : !loanExists
            ? null
            : formatNumber(healthFull, { style: 'percent', maximumFractionDigits: 2 })}
    </>
  )
}

export default CellLoanUserHealth
