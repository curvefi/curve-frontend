import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import { Chip } from '@/ui/Typography'
import type { ChipProps } from '@/ui/Typography/types'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import isUndefined from 'lodash/isUndefined'
import React from 'react'
import styled from 'styled-components'

import useStore from '@/store/useStore'


interface Props extends ChipProps {
  collateralId: string
}

const TableCellRate = ({ collateralId, ...props }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[collateralId])
  const { rate, future_rate } = loanDetails?.parameters ?? {}

  if (isUndefined(rate) || isUndefined(future_rate)) {
    return <></>
  }

  return (
    <Box flex flexAlignItems="center">
      <Chip
        {...props}
        size="md"
        tooltip={
          <>
            <strong>Current Borrow Rate</strong>
            <br />
            {rate}%
          </>
        }
      >
        {formatNumber(rate, FORMAT_OPTIONS.PERCENT)}
      </Chip>
      <StyledIcon name="ArrowRight" size={16} className="svg-arrow" />
      <Chip
        {...props}
        size="md"
        tooltip={
          <>
            <strong>Next Borrow Rate</strong>
            <br />
            {future_rate}%
          </>
        }
      >
        {formatNumber(future_rate, FORMAT_OPTIONS.PERCENT)}
      </Chip>
    </Box>
  )
}

const StyledIcon = styled(Icon)`
  margin-left: 0.2rem;
  margin-right: 0.2rem;
`

export default TableCellRate
