import React from 'react'
import styled from 'styled-components'

import { shortenTokenAddress } from '@/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import { Chip } from '@/ui/Typography'
import { Radio } from '@/ui/Radio'
import Loader from '@/ui/Loader'
import Spacer from '@/ui/Spacer'
import TextEllipsis from '@/ui/TextEllipsis'
import TokenIcon from '@/components/TokenIcon'

type Props = {
  isChecked: boolean
  tokenObj: Token
  value: string
}

const CheckboxOneCoinAmount: React.FC<Props> = ({ isChecked, tokenObj, value }) => {
  const { imageBaseUrl } = usePoolContext()
  const { isLoading: formIsLoading, formValues } = useWithdrawContext()

  const { symbol = '', address = '', ethAddress, haveSameTokenName } = tokenObj ?? {}
  const { lpToken } = formValues

  const ariaLabel = `Withdraw from ${symbol} for ${value}`
  const haveLpToken = Number(lpToken) > 0
  const isLoading = formIsLoading || (haveLpToken && isChecked && value === '0')

  return (
    <Radio key={address} aria-label={ariaLabel} value={address}>
      <StyledTokenIcon size="sm" imageBaseUrl={imageBaseUrl} token={symbol} address={ethAddress || address} /> {symbol}{' '}
      {haveSameTokenName && <StyledChip>{shortenTokenAddress(address)}</StyledChip>}
      <Spacer />
      {isLoading && <Loader skeleton={[90, 20]} />}
      {!isLoading && <TextEllipsis smMaxWidth={'10rem'}>{value}</TextEllipsis>}
    </Radio>
  )
}

const StyledChip = styled(Chip)`
  margin-left: var(--spacing-2);
`

const StyledTokenIcon = styled(TokenIcon)`
  margin-right: var(--spacing-2);
`

export default CheckboxOneCoinAmount
