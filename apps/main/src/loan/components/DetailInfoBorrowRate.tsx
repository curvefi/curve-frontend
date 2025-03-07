import isUndefined from 'lodash/isUndefined'
import { LoanParameter } from '@/loan/types/loan.types'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

interface Props {
  parameters: LoanParameter | undefined
}

const DetailInfoBorrowRate = ({ parameters }: Props) => {
  const { rate, future_rate: futureRate } = parameters ?? {}
  const loading = isUndefined(rate) && isUndefined(futureRate)

  return (
    <DetailInfo loading={loading} loadingSkeleton={[100, 20]} label={t`Borrow rate:`}>
      <span>
        {formatNumber(rate, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}{' '}
        <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
        <strong>{formatNumber(futureRate, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}</strong>
      </span>
    </DetailInfo>
  )
}

export default DetailInfoBorrowRate
