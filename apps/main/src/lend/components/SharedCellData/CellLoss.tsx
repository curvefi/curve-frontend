import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

const SMALL_NUMBER = 0.0001

const CellLoss = ({ userActiveKey, type }: { userActiveKey: string; type: 'amount' | 'percent' }) => {
  const { error, ...details } = useUserLoanDetails(userActiveKey)
  const { loss, loss_pct } = details?.loss ?? {}

  return (
    <>
      {error ? (
        '?'
      ) : Object.keys(details).length === 0 ? (
        '-'
      ) : type === 'amount' ? (
        <>{loss === undefined ? '?' : Number(loss) <= SMALL_NUMBER || Number(loss) === 0 ? 0 : formatNumber(loss)}</>
      ) : type === 'percent' ? (
        <>
          {loss_pct === undefined
            ? '?'
            : Number(loss_pct) <= SMALL_NUMBER || Number(loss_pct) === 0
              ? 0
              : formatNumber(loss_pct, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}
        </>
      ) : null}
    </>
  )
}

export default CellLoss
