import React from 'react'

import DetailsLoan from '@/lend/components/DetailsMarket/components/DetailsLoan'
import DetailsSupply from '@/lend/components/DetailsMarket/components/DetailsSupply'

const DetailsMarket = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) =>
  type === 'borrow' ? <DetailsLoan {...pageProps} type={type} /> : <DetailsSupply {...pageProps} type={type} />

export default DetailsMarket
