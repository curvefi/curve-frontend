import React from 'react'

import TokensIconComp, { type TokensIconProps } from 'ui/src/Token/TokensIcon'
import TokenIcon from '@/components/TokenIcon'

export type Props = Omit<TokensIconProps, 'childComp'>

const TokenIcons = ({ className = '', ...props }: Props) => {
  return <TokensIconComp {...props} className={className} childComp={TokenIcon} />
}

export default TokenIcons
