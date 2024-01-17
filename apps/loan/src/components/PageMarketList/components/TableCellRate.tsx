import type { ChipProps } from '@/ui/Typography/types'

import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'
import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'

interface Props extends ChipProps {
  parameters: LoanDetails['parameters'] | undefined
}

const TableCellRate = ({ parameters, ...props }: Props) => {
  const { rate, future_rate } = parameters ?? {}

  return isUndefined(rate) || isUndefined(future_rate) ? (
    <></>
  ) : (
    <Box flex>
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
