import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import Icon from '@/ui/Icon'

const CellRate = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const resp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : type === 'borrow' ? (
        <Chip {...props}>{formatNumber(rates?.borrowApy, FORMAT_OPTIONS.PERCENT)}</Chip>
      ) : type === 'supply' ? (
        <Chip
          {...props}
          tooltipProps={{ minWidth: '100px' }}
          tooltip={<Tooltip>{formatNumber(rates?.lendApy, FORMAT_OPTIONS.PERCENT)} APY</Tooltip>}
        >
          {formatNumber(rates?.lendApr, FORMAT_OPTIONS.PERCENT)}{' '}
          <Icon name="InformationSquare" className="svg-tooltip" size={16} />
        </Chip>
      ) : null}
    </>
  )
}

const Tooltip = styled.div`
  white-space: nowrap;
`

export default CellRate
