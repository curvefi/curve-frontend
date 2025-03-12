import { useMemo } from 'react'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import TextCaption from '@ui/TextCaption'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

const CellCap = ({
  rChainId,
  rOwmId,
  type,
}: {
  rChainId: ChainId
  rOwmId: string
  type: 'cap' | 'available' | 'cap-utilization' | 'utilization'
}) => {
  const resp = useStore((state) => state.markets.statsCapAndAvailableMapper[rChainId]?.[rOwmId])
  const totalResp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { cap, available, error } = resp ?? {}
  const { totalDebt } = totalResp ?? {}

  const { formattedAvailable, formattedCap, formattedLiquidityUtilization } = useMemo(() => {
    const haveCap = typeof cap !== 'undefined' && +(+cap) > 0
    const haveTotalDebt = typeof totalDebt !== 'undefined'
    const liquidityUtilization = haveTotalDebt && haveCap ? (+(totalDebt ?? '0') / +cap) * 100 : ''

    return {
      formattedAvailable: formatNumber(available, { notation: 'compact', defaultValue: '-' }),
      formattedCap: formatNumber(cap, { notation: 'compact', defaultValue: '-' }),
      formattedLiquidityUtilization:
        liquidityUtilization !== ''
          ? liquidityUtilization !== 0 && liquidityUtilization < 0.000001
            ? '0%'
            : formatNumber(liquidityUtilization, {
                ...FORMAT_OPTIONS.PERCENT,
                defaultValue: '-',
              })
          : '',
    }
  }, [available, cap, totalDebt])

  return (
    <>
      {typeof resp === 'undefined' || typeof totalResp === 'undefined' ? (
        '-'
      ) : error ? (
        '?'
      ) : type === 'available' ? (
        formattedAvailable
      ) : type === 'cap' ? (
        formattedCap
      ) : type === 'utilization' ? (
        formattedLiquidityUtilization || '0%'
      ) : type === 'cap-utilization' ? (
        <>
          {formattedCap}
          {formattedLiquidityUtilization && (
            <>
              <br />
              <TextCaption>{formattedLiquidityUtilization}</TextCaption>
            </>
          )}
        </>
      ) : null}
    </>
  )
}

export default CellCap
