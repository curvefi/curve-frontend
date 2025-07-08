import useStore from '@/lend/store/useStore'
import { formatNumber } from '@ui/utils'

const CellLoanUserHealth = ({ userActiveKey }: { userActiveKey: string }) => {
  const loanExistsResp = useStore(state => state.user.loansExistsMapper[userActiveKey])
  const userLoanHealthResp = useStore(state => state.user.loansHealthsMapper[userActiveKey])

  const { loanExists, error: loanExistsError } = loanExistsResp ?? {}
  const { healthFull, healthNotFull, error: userLoanDetailsError } = userLoanHealthResp ?? {}

  const health = +healthNotFull < 0 ? healthNotFull : healthFull

  return (
    <>
      {typeof loanExistsResp === 'undefined'
        ? null
        : loanExistsError || (loanExists && userLoanDetailsError)
          ? '?'
          : !loanExists
            ? null
            : formatNumber(health, { style: 'percent', maximumFractionDigits: 2 })}
    </>
  )
}

export default CellLoanUserHealth
