import React from 'react'

import DetailsUserLoan from '@/lend/components/DetailsUser/components/DetailsUserLoan'
import DetailsUserSupply from '@/lend/components/DetailsUser/components/DetailsUserSupply'
import { PageContentProps } from '@/lend/types/lend.types'

const DetailsUser = ({ type, ...pageProps }: PageContentProps & { type: 'borrow' | 'supply' }) =>
  type === 'borrow' ? <DetailsUserLoan {...pageProps} /> : <DetailsUserSupply {...pageProps} />

export default DetailsUser
