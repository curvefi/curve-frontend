import React from 'react'

import DetailsUserLoan from '@/lend/components/DetailsUser/components/DetailsUserLoan'
import DetailsUserSupply from '@/lend/components/DetailsUser/components/DetailsUserSupply'

const DetailsUser = ({ type, ...pageProps }: PageContentProps & { type: 'borrow' | 'supply' }) =>
  type === 'borrow' ? <DetailsUserLoan {...pageProps} /> : <DetailsUserSupply {...pageProps} />

export default DetailsUser
