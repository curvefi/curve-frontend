import React from 'react'
import useStore from '@/lend/store/useStore'

import TokenIconComp, { type TokenIconProps } from '@/ui/Token/TokenIcon'

function TokenIcon(props: Omit<TokenIconProps, 'setTokenImage'>) {
  const storedSrc = useStore((state) => state.tokens.tokensImage[props.address || ''])
  const setTokenImage = useStore((state) => state.tokens.setTokenImage)

  return <TokenIconComp {...props} storedSrc={storedSrc} setTokenImage={setTokenImage} />
}

export default TokenIcon
