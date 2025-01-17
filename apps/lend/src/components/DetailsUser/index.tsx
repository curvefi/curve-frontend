import React from 'react'

import DetailsUserLoan from '@/components/DetailsUser/components/DetailsUserLoan'
import DetailsUserSupply from '@/components/DetailsUser/components/DetailsUserSupply'
import { PageContentProps } from '@/types/lend.types'

const DetailsUser = ({ type, ...pageProps }: PageContentProps & { type: 'borrow' | 'supply' }) =>
  type === 'borrow' ? <DetailsUserLoan {...pageProps} /> : <DetailsUserSupply {...pageProps} />

export default DetailsUser
