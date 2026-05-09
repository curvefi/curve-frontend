import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { t } from '@ui-kit/lib/i18n'
import { amount as toAmount, formatNumber } from '@ui-kit/utils'

type Props = Pick<WalletPoolData, 'claimableCrv' | 'claimableOthers' | 'claimablesTotalUsd'> & {
  isMobile?: boolean
  isHighLight: boolean
}

export const TableCellClaimables = ({
  isHighLight,
  claimableCrv,
  claimableOthers,
  claimablesTotalUsd,
  isMobile,
}: Props) => (
  <>
    {claimableCrv?.map(({ symbol, amount }, idx) => {
      const formatted = `${formatNumber(toAmount(amount), { abbreviate: false }) ?? '-'} CRV`
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    {claimableOthers?.map(({ symbol, amount }, idx) => {
      const formatted = `${formatNumber(toAmount(amount), { abbreviate: false }) ?? '-'} ${symbol}`
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    <div>
      {isHighLight && claimablesTotalUsd > 0 && (
        <DetailText>{formatNumber(claimablesTotalUsd, { unit: 'dollar', abbreviate: false })}</DetailText>
      )}
    </div>
    {isMobile && !claimableCrv && claimableOthers?.length === 0 && t`None`}
  </>
)
