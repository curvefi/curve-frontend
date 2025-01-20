import type { Slippage } from '@main/components/PagePool/types'

import React, { useMemo } from 'react'
import { t, Trans } from '@lingui/macro'

import { formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import DetailInfo from '@ui/DetailInfo'
import IconTooltip from '@ui/Tooltip/TooltipIcon'

interface Props extends Slippage {}

type SlippageDetail = {
  isBold: boolean
  label: string | React.ReactNode
  tip: string
  variant: 'warning' | 'success' | ''
}

const DetailInfoSlippage = ({ loading, isHighSlippage, isBonus, slippage }: Props) => {
  const { isBold, label, tip, variant } = useMemo(() => {
    let slippageDetail: SlippageDetail = {
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
      tooltip={tip ? <IconTooltip placement="top end">{tip}</IconTooltip> : null}
    >
      {formatNumber(slippage, {
        style: 'percent',
        maximumFractionDigits: 4,
        trailingZeroDisplay: 'stripIfInteger',
        defaultValue: '-',
      })}
    </DetailInfo>
  )
}

export default DetailInfoSlippage
