import type { ComboBoxSelectTokenProps } from '@/dex/components/ComboBoxSelectToken/types'

import React from 'react'
import styled from 'styled-components'

import { focusVisible } from '@ui/utils'
import { shortenTokenAddress } from '@/dex/utils'

import Box from '@ui/Box'
import Button from '@ui/Button'
import Chip from '@ui/Typography/Chip'
import SelectTokenListItemUserBalance from '@/dex/components/ComboBoxSelectToken/ComboBoxTokenUserBalance'
import TokenIcon from '@/dex/components/TokenIcon'

const ComboBoxListItem = ({
  imageBaseUrl,
  testId,
  showBalances,
  selectedToken,
  handleOnSelectChange,
  ...item
}: Pick<ComboBoxSelectTokenProps, 'testId' | 'imageBaseUrl' | 'showBalances'> &
  Token & {
    selectedToken: string
    handleOnSelectChange(selectedToken: string): void
  }) => (
  <li>
    <ItemButton
      variant="outlined"
      className={selectedToken === item.address ? 'active' : ''}
      onClick={() => handleOnSelectChange(item.address)}
    >
      <IconWrapper>
        <TokenIcon imageBaseUrl={imageBaseUrl} token={item.symbol} address={item.ethAddress || item.address} />
      </IconWrapper>
      <LabelTextWrapper flex flexDirection="column" flexAlignItems="flex-start">
        <LabelText data-testid={`li-${testId}`}>{item.symbol}</LabelText>
        <Chip isMono opacity={0.5}>
          {shortenTokenAddress(item.address)}
        </Chip>
      </LabelTextWrapper>
      {showBalances && <SelectTokenListItemUserBalance tokenAddress={item.address} />}
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

const IconWrapper = styled.div`
  min-width: 1.875rem; // 30px;
  text-align: left;
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
