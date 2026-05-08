import lodash from 'lodash'
import { LoanParameter } from '@/loan/types/loan.types'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { FORMAT_OPTIONS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber, amount } from '@ui-kit/utils'

interface Props {
  parameters: LoanParameter | undefined
}

export const DetailInfoBorrowRate = ({ parameters }: Props) => {
  const borrowApr = parameters?.rates?.borrowApr
  const futureBorrowApr = parameters?.future_rates?.borrowApr
  const loading = lodash.isUndefined(borrowApr) && lodash.isUndefined(futureBorrowApr)

  return (
    <DetailInfo loading={loading} loadingSkeleton={[100, 20]} label={t`Borrow APR:`}>
      <span>
        {formatNumber(amount(borrowApr), { ...FORMAT_OPTIONS.PERCENT, abbreviate: false }) ?? '-'}{' '}
        <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
        <strong>
          {formatNumber(amount(futureBorrowApr), { ...FORMAT_OPTIONS.PERCENT, abbreviate: false }) ?? '-'}
        </strong>
      </span>
    </DetailInfo>
  )
}
