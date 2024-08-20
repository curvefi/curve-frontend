import React from 'react'

import TokenIcon from '@/components/TokenIcon'
import TokensIconComp, { type TokensIconProps } from 'ui/src/Token/TokensIcon'

export type Props = Omit<TokensIconProps, 'childComp'>

const TokenIcons = ({ className = '', ...props }: Props) => {
  return <TokensIconComp {...props} className={className} childComp={TokenIcon} />
}

export default TokenIcons
