import useStore from '@/lend/store/useStore'
import { formatNumber } from '@ui/utils'

const CellLoanUserState = ({ userActiveKey }: { userActiveKey: string }) => {
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const stateResp = useStore((state) => state.user.loansStatesMapper[userActiveKey])

  const { error: stateError, debt } = stateResp ?? {}
  const { error: loanExistsError, loanExists } = loanExistsResp ?? {}

  return (
    <>
      {typeof loanExistsResp === 'undefined'
        ? null
        : stateError || loanExistsError
          ? '?'
          : !loanExists
            ? null
            : formatNumber(debt, { notation: 'compact', defaultValue: '-' })}
    </>
  )
}

export default CellLoanUserState
