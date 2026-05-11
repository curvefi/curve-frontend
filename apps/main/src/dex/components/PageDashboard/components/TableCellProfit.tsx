import { useMemo } from 'react'
import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData, SortId } from '@/dex/components/PageDashboard/types'
import { formatNumber, amount } from '@ui-kit/utils'

type Props = Pick<WalletPoolData, 'profitBase' | 'profitCrv' | 'profitOthers' | 'profitsTotalUsd'> & {
  sortBy: SortId
}

export const TableCellProfit = ({ profitBase, profitCrv, profitOthers, profitsTotalUsd, sortBy }: Props) => {
  const formattedBaseProfit = useMemo(
    () => formatNumber(amount(profitBase?.day), { abbreviate: false, fallback: '-' }),
    [profitBase?.day],
  )
  const formattedCrvProfit = useMemo(
    () => `${formatNumber(amount(profitCrv?.day), { abbreviate: false, fallback: '-' })} CRV`,
    [profitCrv?.day],
  )
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
        const formatted = `${formatNumber(amount(day), { abbreviate: false, fallback: '-' })} ${symbol}`
        return Number(day) > 0 && <Info key={symbol}>{isHighLight ? <strong>{formatted}</strong> : formatted}</Info>
      })}

      <div>
        {isHighLight && profitsTotalUsd > 0 && (
          <DetailText>{formatNumber(profitsTotalUsd, { unit: 'dollar', abbreviate: false })}</DetailText>
        )}
      </div>
    </>
  )
}
