import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { ReactNode } from 'react'

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
