import { useMemo } from 'react'
import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData, SortId } from '@/dex/components/PageDashboard/types'
import { amount, formatNumber, formatTokenAmount } from '@ui-kit/utils'

type Props = Pick<WalletPoolData, 'profitBase' | 'profitCrv' | 'profitOthers' | 'profitsTotalUsd'> & {
  sortBy: SortId
}

export const TableCellProfit = ({ profitBase, profitCrv, profitOthers, profitsTotalUsd, sortBy }: Props) => {
  const formattedBaseProfit = useMemo(
    () => formatNumber(amount(profitBase?.day), { abbreviate: false, fallback: '-' }),
    [profitBase?.day],
  )
  const formattedCrvProfit = useMemo(() => formatTokenAmount(amount(profitCrv?.day), 'CRV'), [profitCrv?.day])
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
        const formatted = formatTokenAmount(amount(day), symbol)
        return Number(day) > 0 && <Info key={symbol}>{isHighLight ? <strong>{formatted}</strong> : formatted}</Info>
      })}

      <div>
        {isHighLight && profitsTotalUsd > 0 && <DetailText>{formatNumber(profitsTotalUsd, 'usd.amount')}</DetailText>}
      </div>
    </>
  )
}
