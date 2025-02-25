import type { PageLoanManageProps } from '@/loan/components/PageLoanManage/types'

import { t } from '@ui-kit/lib/i18n'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/loan/store/useStore'

import { Chip } from '@ui/Typography'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId'> {}

const LoanInfoParameters = ({ llamma, llammaId }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])

  const { parameters, priceInfo } = loanDetails ?? {}

  return (
    <Box grid gridRowGap="1">
      <DetailInfo label={t`Band width factor`} size="md">
        <span>{formatNumber(llamma?.A, { useGrouping: false })}</span>
      </DetailInfo>
      <DetailInfo label={t`Base price`} size="md">
        {typeof loanDetails?.basePrice !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(loanDetails.basePrice, { showAllFractionDigits: true })}
            tooltipProps={{ placement: 'top end' }}
          >
            {formatNumber(loanDetails.basePrice)}
          </Chip>
        )}
      </DetailInfo>
      <DetailInfo label={t`Oracle price`} size="md">
        {typeof priceInfo?.oraclePrice !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(priceInfo.oraclePrice, { showAllFractionDigits: true })}
            tooltipProps={{ placement: 'top end' }}
          >
            {formatNumber(priceInfo.oraclePrice)}
          </Chip>
        )}
      </DetailInfo>
      <DetailInfo label={t`Borrow rate`} size="md">
        {typeof parameters?.rate !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(parameters.rate, { showAllFractionDigits: true, style: 'percent' })}
            tooltipProps={{ placement: 'top end' }}
          >
            {formatNumber(parameters.rate, FORMAT_OPTIONS.PERCENT)}
          </Chip>
        )}
      </DetailInfo>
    </Box>
  )
}

export default LoanInfoParameters
