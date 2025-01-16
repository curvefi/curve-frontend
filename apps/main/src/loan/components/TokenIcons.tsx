import React from 'react'

import TokenIcon from '@/loan/components/TokenIcon'
import TokensIconComp, { type TokensIconProps } from '@ui/Token/TokensIcon'

export type Props = Omit<TokensIconProps, 'childComp'>

const TokenIcons = ({ className = '', ...props }: Props) => (
  <TokensIconComp {...props} className={className} childComp={TokenIcon} />
)

export default TokenIcons
