import { ReactNode, useMemo } from 'react'
import type { Slippage } from '@/dex/components/PagePool/types'
import { DetailInfo } from '@ui/DetailInfo'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { t, Trans } from '@ui-kit/lib/i18n'

type SlippageDetail = {
  isBold: boolean
  label: ReactNode
  tip: string
  variant: 'warning' | 'success' | ''
}

export const DetailInfoSlippage = ({ loading, isHighSlippage, isBonus, slippage }: Slippage) => {
  const { isBold, label, tip, variant } = useMemo(() => {
    const slippageDetail: SlippageDetail = {
      isBold: false,
      label: t`Slippage`,
      tip: '',
      variant: '',
    }

    if (isHighSlippage) {
      slippageDetail.variant = 'warning'
      slippageDetail.isBold = true
      slippageDetail.label = (
        <>
          <Trans>Slippage Loss</Trans>{' '}
          <Chip isNotBold size="xs">
            (incl. pricing):
          </Chip>
        </>
      )
      slippageDetail.tip = t`Slippage comes from depositing too many coins not in balance, and current coin prices are additionally accounted for`
    } else if (isBonus) {
      slippageDetail.variant = 'success'
      slippageDetail.isBold = true
      slippageDetail.label = (
        <>
          <Trans>Slippage Bonus</Trans>{' '}
          <Chip isNotBold size="xs">
            (incl. pricing):
          </Chip>
        </>
      )
      slippageDetail.tip = t`Bonus comes as an advantage from current coin prices which usually appears for coins which are low in balance`
    }

    return slippageDetail
  }, [isBonus, isHighSlippage])

  return (
    <DetailInfo
      isBold={isBold}
      loading={loading}
      loadingSkeleton={[50, 23]}
      variant={variant}
      label={label}
      tooltip={tip ? <IconTooltip placement="top-end">{tip}</IconTooltip> : null}
    >
      {formatNumber(slippage, {
        style: 'percent',
        maximumFractionDigits: 4,
        defaultValue: '-',
      })}
    </DetailInfo>
  )
}
