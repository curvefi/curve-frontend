import React from 'react'

import DetailsLoan from '@/components/DetailsMarket/components/DetailsLoan'
import DetailsSupply from '@/components/DetailsMarket/components/DetailsSupply'

const DetailsMarket = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) =>
  type === 'borrow' ? <DetailsLoan {...pageProps} type={type} /> : <DetailsSupply {...pageProps} type={type} />

export default DetailsMarket
