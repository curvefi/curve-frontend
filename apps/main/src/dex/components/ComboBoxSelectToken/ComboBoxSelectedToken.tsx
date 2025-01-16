import React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/dex/utils'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import TokenIcon from '@/dex/components/TokenIcon'

const ComboBoxSelectedToken = ({
  imageBaseUrl,
  selected,
  testId,
}: {
  imageBaseUrl: string
  selected: Token
  testId: string | undefined
}) => (
  <>
    <TokenIconWrapper>
      <TokenIcon
        imageBaseUrl={imageBaseUrl}
        token={selected.symbol}
        size="sm"
        address={selected.ethAddress || selected.address}
      />
    </TokenIconWrapper>
    <LabelTextWrapper grid>
      <SelectedLabelText data-testid={`label-${testId}`} title={selected.symbol}>
        {selected.symbol}
      </SelectedLabelText>{' '}
      {selected?.haveSameTokenName && <AddressChip size="xs">{shortenTokenAddress(selected.address)}</AddressChip>}
    </LabelTextWrapper>
  </>
)

const AddressChip = styled(Chip)`
  margin-top: var(--spacing-1);
`

const SelectedLabelText = styled.span`
  overflow: hidden;

  font-size: var(--input_button--font-size);
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TokenIconWrapper = styled.div`
  display: inline-block;
  min-height: 1.25rem; // 20px
  min-width: 1.25rem; // 20px
`

const LabelTextWrapper = styled(Box)`
  overflow: hidden;
  text-overflow: ellipsis;
`

export default ComboBoxSelectedToken
