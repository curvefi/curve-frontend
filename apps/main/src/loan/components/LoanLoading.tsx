import { ReactNode } from 'react'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'

type Props = {
  children: ReactNode
  loaded: boolean
}

const LoanLoading = ({ children, loaded }: Props) =>
  !loaded ? (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  ) : (
    <>{children}</>
  )

export default LoanLoading
