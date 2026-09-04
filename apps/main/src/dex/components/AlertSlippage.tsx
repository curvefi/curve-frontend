import { useMemo } from 'react'
import { formatNumber, amount } from '@evm-ui/utils'
import { AlertBox } from '@legacy-ui/AlertBox'
import { Trans } from '@ui/lib/i18n'

type Props = {
  maxSlippage: string | undefined
  usdAmount?: string | number
}

export const AlertSlippage = ({ maxSlippage, usdAmount }: Props) => {
  const maxUsdSlippage = useMemo(() => {
    if (maxSlippage && usdAmount && usdAmount !== 'NaN') {
      const max = Number(usdAmount) * (Number(maxSlippage) / 100)
      return max > 1000 ? max : 0
    }
    return 0
  }, [maxSlippage, usdAmount])

  return maxUsdSlippage ? (
    <AlertBox alertType="warning">
      <div>
        <Trans>
          With your current slippage tolerance setting ({formatNumber(amount(maxSlippage), 'percent.value')}
          ), the expected output displayed above might incur up to{' '}
          <strong>
            {formatNumber(maxUsdSlippage, {
              maximumFractionDigits: 0,
              unit: 'dollar',
              abbreviate: false,
            })}{' '}
            worth of slippage
          </strong>{' '}
          (in addition to the price impact). We recommend that you reduce your slippage tolerance setting just above.
        </Trans>
      </div>
    </AlertBox>
  ) : null
}
