import { formatNumber } from '@/ui/utils'
import type { IProfit } from '@curvefi/api/lib/interfaces'
import { Info } from '@/components/PageDashboard/components/TableRow'
import type { SortId } from '@/components/PageDashboard/types'


import type { UserBaseProfit } from '@/types'

type Props = {
  baseProfit?: UserBaseProfit
  crvProfit?: IProfit
  tokensProfit?: IProfit[]
  sortBy: SortId
}

const TableCellProfit = ({ baseProfit, crvProfit, tokensProfit, sortBy }: Props) => {
  const formattedBaseProfit = formatNumber(baseProfit?.day || '0')
  const formattedCrvProfit = `${formatNumber(crvProfit?.day || '0')} CRV`
  return (
    <>
      {baseProfit?.day && +baseProfit.day > 0 && (
        <Info>{sortBy === 'baseProfit' ? <strong>{formattedBaseProfit}</strong> : formattedBaseProfit}</Info>
      )}
      {crvProfit?.day && +crvProfit?.day > 0 && (
        <Info>{sortBy === 'crvProfit' ? <strong>{formattedCrvProfit}</strong> : formattedCrvProfit}</Info>
      )}

      {tokensProfit?.map((token) => {
        return Number(token.day) > 0 ? (
          <Info key={token.symbol}>
            {formatNumber(token.day)} {token.symbol}
          </Info>
        ) : null
      })}
    </>
  )
}

export default TableCellProfit
