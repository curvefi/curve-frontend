import React from 'react'
import useStore from '@/loan/store/useStore'

import { type TokenIconProps, TokenIcon as TokenIconComp } from '@ui-kit/shared/ui/TokenIcon'

function TokenIcon(props: Omit<TokenIconProps, 'setTokenImage'>) {
  const storedSrc = useStore((state) => state.tokens.tokensImage[props.address || ''])
  const setTokenImage = useStore((state) => state.tokens.setTokenImage)

  return <TokenIconComp {...props} storedSrc={storedSrc} setTokenImage={setTokenImage} />
}

export default TokenIcon
