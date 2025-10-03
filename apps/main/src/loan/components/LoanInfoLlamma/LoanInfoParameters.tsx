import type { PageLoanManageProps } from '@/loan/components/PageLoanManage/types'
import useStore from '@/loan/store/useStore'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

interface Props extends Pick<PageLoanManageProps, 'llamma' | 'llammaId'> {}

const LoanInfoParameters = ({ llamma, llammaId }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])

  const { parameters, priceInfo } = loanDetails ?? {}

  return (
    <Box grid gridRowGap="1">
      <DetailInfo label={t`Band width factor`}>
        <span>{formatNumber(llamma?.A, { useGrouping: false })}</span>
      </DetailInfo>
      <DetailInfo label={t`Base price`}>
        {typeof loanDetails?.basePrice !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(loanDetails.basePrice, { decimals: 5 })}
            tooltipProps={{ placement: 'top-end' }}
          >
            {formatNumber(loanDetails.basePrice)}
          </Chip>
        )}
      </DetailInfo>
      <DetailInfo label={t`Oracle price`}>
        {typeof priceInfo?.oraclePrice !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(priceInfo.oraclePrice, { decimals: 5 })}
            tooltipProps={{ placement: 'top-end' }}
          >
            {formatNumber(priceInfo.oraclePrice)}
          </Chip>
        )}
      </DetailInfo>
      <DetailInfo label={t`Borrow rate`}>
        {typeof parameters?.rate !== 'undefined' && (
          <Chip
            size="md"
            tooltip={formatNumber(parameters.rate, { style: 'percent', decimals: 5 })}
            tooltipProps={{ placement: 'top-end' }}
          >
            {formatNumber(parameters.rate, FORMAT_OPTIONS.PERCENT)}
          </Chip>
        )}
      </DetailInfo>
    </Box>
  )
}

export default LoanInfoParameters
