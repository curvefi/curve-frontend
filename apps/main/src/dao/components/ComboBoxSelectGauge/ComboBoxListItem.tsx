import type { ComboBoxSelectGaugeProps } from '@/dao/components/ComboBoxSelectGauge/types'

import React from 'react'
import styled from 'styled-components'

import { focusVisible } from '@ui/utils'
import { shortenTokenAddress } from '@ui/utils'

import Box from '@ui/Box'
import Button from '@ui/Button'
import Chip from '@ui/Typography/Chip'
import { GaugeFormattedData } from '@/dao/types/dao.types'

const ComboBoxListItem = ({
  testId,
  selectedGauge,
  handleOnSelectChange,
  ...item
}: Pick<ComboBoxSelectGaugeProps, 'testId'> &
  GaugeFormattedData & {
    selectedGauge: GaugeFormattedData | null
    handleOnSelectChange(selectedGauge: string): void
  }) => (
  <li>
    <ItemButton
      variant="outlined"
      className={selectedGauge?.address === item.address ? 'active' : ''}
      onClick={() => handleOnSelectChange(item.address)}
    >
      <LabelTextWrapper flex flexDirection="column" flexAlignItems="flex-start">
        <LabelText data-testid={`li-${testId}`}>{item.title}</LabelText>
        <Chip isMono opacity={0.5}>
          {shortenTokenAddress(item.address)}
        </Chip>
      </LabelTextWrapper>
    </ItemButton>
  </li>
)

const ItemButton = styled(Button)`
  ${focusVisible};

  &.focus-visible,
  &.active {
    color: var(--box--primary--color);
    background-color: var(--table_detail_row--active--background-color);
  }
  align-items: center;
  border: none;
  display: grid;
  font-family: inherit;
  padding: 0 var(--spacing-3);
  grid-column-gap: var(--spacing-2);
  grid-template-columns: auto 1fr auto;
  height: 50px;
  width: 100%;
`

const LabelText = styled.div`
  overflow: hidden;

  font-size: var(--font-size-4);
  font-weight: var(--font-weight--bold);
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: initial;
`

const LabelTextWrapper = styled(Box)`
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ComboBoxListItem
