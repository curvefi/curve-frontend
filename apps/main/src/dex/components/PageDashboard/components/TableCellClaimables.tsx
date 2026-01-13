import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = Pick<WalletPoolData, 'claimableCrv' | 'claimableOthers' | 'claimablesTotalUsd'> & {
  isMobile?: boolean
  isHighLight: boolean
}

export const TableCellClaimables = ({ isHighLight, claimableCrv, claimableOthers, claimablesTotalUsd, isMobile }: Props) => (
  <>
    {claimableCrv?.map(({ symbol, amount }, idx) => {
      const formatted = `${formatNumber(amount)} CRV`
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    {claimableOthers?.map(({ symbol, amount }, idx) => {
      const formatted = `${formatNumber(amount)} ${symbol}`
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    <div>
      {isHighLight && claimablesTotalUsd > 0 && (
        <DetailText>{formatNumber(claimablesTotalUsd, { ...FORMAT_OPTIONS.USD })}</DetailText>
      )}
    </div>
    {isMobile && !claimableCrv && claimableOthers?.length === 0 && t`None`}
  </>
)
