import type { ChipProps } from '@/ui/Typography/types'

import { useMemo } from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import TextCaption from '@/ui/TextCaption'

const CellCap = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
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
          ? formatNumber(liquidityUtilization, {
              ...FORMAT_OPTIONS.PERCENT,
              defaultValue: '-',
            })
          : '',
    }
  }, [available, cap, totalDebt])

  return (
    <>
      {typeof resp === 'undefined' || typeof totalResp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>
          {type === 'available' ? (
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
        </Chip>
      )}
    </>
  )
}

export default CellCap
