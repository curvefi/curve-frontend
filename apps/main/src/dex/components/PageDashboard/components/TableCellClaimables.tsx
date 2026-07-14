import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { t } from '@ui-kit/lib/i18n'
import { amount as toAmount, formatNumber, formatToken } from '@ui-kit/utils'

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
      const formatted = formatToken(toAmount(amount), 'CRV', 'amount')
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    {claimableOthers?.map(({ symbol, amount }, idx) => {
      const formatted = formatToken(toAmount(amount), symbol, 'amount')
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      return <Info key={`${symbol}${idx}`}>{isHighLight ? <strong>{formatted}</strong> : <>{formatted}</>}</Info>
    })}
    <div>
      {isHighLight && claimablesTotalUsd > 0 && (
        <DetailText>{formatNumber(claimablesTotalUsd, 'usd.amount')}</DetailText>
      )}
    </div>
    {isMobile && !claimableCrv && claimableOthers?.length === 0 && t`None`}
  </>
)
