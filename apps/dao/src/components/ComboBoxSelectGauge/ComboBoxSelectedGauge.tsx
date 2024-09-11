import React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'

const ComboBoxSelectedToken = ({
  imageBaseUrl,
  selected,
  testId,
}: {
  imageBaseUrl: string
  selected: GaugeFormattedData
  testId: string | undefined
}) => {
  return (
    <>
      <LabelTextWrapper grid>
        <SelectedLabelText data-testid={`label-${testId}`} title={selected.title}>
          {selected.title}
        </SelectedLabelText>{' '}
        <AddressChip isMono size="xs">
          {shortenTokenAddress(selected.address)}
        </AddressChip>
      </LabelTextWrapper>
    </>
  )
}

const AddressChip = styled(Chip)`
  margin-top: var(--spacing-1);
`

const SelectedLabelText = styled.span`
  overflow: hidden;

  font-size: var(--input_button--font-size);
  text-overflow: ellipsis;
  white-space: nowrap;
`

const LabelTextWrapper = styled(Box)`
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ComboBoxSelectedToken
