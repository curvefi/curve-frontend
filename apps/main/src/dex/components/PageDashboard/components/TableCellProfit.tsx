import { useMemo } from 'react'
import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData, SortId } from '@/dex/components/PageDashboard/types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = Pick<WalletPoolData, 'profitBase' | 'profitCrv' | 'profitOthers' | 'profitsTotalUsd'> & {
  sortBy: SortId
}

export const TableCellProfit = ({ profitBase, profitCrv, profitOthers, profitsTotalUsd, sortBy }: Props) => {
  const formattedBaseProfit = useMemo(() => formatNumber(profitBase?.day || 0), [profitBase?.day])
  const formattedCrvProfit = useMemo(() => `${formatNumber(profitCrv?.day || '0')} CRV`, [profitCrv?.day])
  const isHighLight = sortBy === 'profits'

  return (
    <>
      {profitBase?.day && +profitBase.day > 0 && (
        <Info>{isHighLight ? <strong>{formattedBaseProfit}</strong> : formattedBaseProfit}</Info>
      )}

      {profitCrv?.day && +profitCrv?.day > 0 && (
        <Info>{isHighLight ? <strong>{formattedCrvProfit}</strong> : formattedCrvProfit}</Info>
      )}

      {profitOthers?.map(({ day, symbol }) => {
        const formatted = `${formatNumber(day)} ${symbol}`
        return Number(day) > 0 && <Info key={symbol}>{isHighLight ? <strong>{formatted}</strong> : formatted}</Info>
      })}

      <div>
        {isHighLight && profitsTotalUsd > 0 && (
          <DetailText>{formatNumber(profitsTotalUsd, { ...FORMAT_OPTIONS.USD })}</DetailText>
        )}
      </div>
    </>
  )
}
