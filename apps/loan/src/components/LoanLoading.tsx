import React from 'react'

import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

type Props = {
  loaded: boolean
}

const LoanLoading = ({ children, loaded }: React.PropsWithChildren<Props>) => {
  return !loaded ? (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  ) : (
    <>{children}</>
  )
}

export default LoanLoading
