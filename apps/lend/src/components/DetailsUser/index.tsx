import React from 'react'

import DetailsUserLoan from '@/components/DetailsUser/components/DetailsUserLoan'
import DetailsUserSupply from '@/components/DetailsUser/components/DetailsUserSupply'

const DetailsUser = ({ type, ...pageProps }: PageContentProps & { type: 'borrow' | 'supply' }) => {
  return type === 'borrow' ? <DetailsUserLoan {...pageProps} /> : <DetailsUserSupply {...pageProps} />
}

export default DetailsUser
