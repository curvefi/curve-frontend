import type { WalletPoolData } from '@/dex/components/PageDashboard/types'

import React from 'react'
import { t } from '@ui-kit/lib/i18n'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

import { DetailText, Info } from '@/dex/components/PageDashboard/components/TableRow'

type Props = Pick<WalletPoolData, 'claimableCrv' | 'claimableOthers' | 'claimablesTotalUsd'> & {
  isMobile?: boolean
  isHighLight: boolean
}

const TableCellClaimables = ({ isHighLight, claimableCrv, claimableOthers, claimablesTotalUsd, isMobile }: Props) => (
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

export default TableCellClaimables
