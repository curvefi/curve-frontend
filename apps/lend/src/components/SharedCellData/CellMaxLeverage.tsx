import TextCaption from '@/ui/TextCaption'
import Chip from '@/ui/Typography/Chip'
import type { ChipProps } from '@/ui/Typography/types'

import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'


const CellMaxLeverage = ({
  className = '',
  rChainId,
  rOwmId,
  showTitle,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
  showTitle?: boolean
}) => {
  const maxLeverageResp = useStore((state) => state.markets.maxLeverageMapper[rChainId]?.[rOwmId])

  const { maxLeverage, error } = maxLeverageResp ?? {}

  return (
    <>
      {typeof maxLeverageResp === 'undefined' || maxLeverage === '' ? null : error ? (
        '?'
      ) : (
        <StyledChip {...props} $isMarginTop={showTitle}>
          {showTitle ? (
            <TextCaption isBold isCaps>
              {t`Leverage:`}{' '}
            </TextCaption>
          ) : (
            ''
          )}
          up to x{formatNumber(maxLeverage, { maximumSignificantDigits: 2 })}🔥
        </StyledChip>
      )}
    </>
  )
}

const StyledChip = styled(Chip)<{ $isMarginTop?: boolean }>`
  white-space: nowrap;
  ${({ $isMarginTop }) => {
    if ($isMarginTop) {
      return `
        display: inline-block;
        margin-top: var(--spacing-2);
        margin-bottom: var(--spacing-1);
      `
    }
  }}
`

export default CellMaxLeverage
