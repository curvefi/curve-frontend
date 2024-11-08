import Image from 'next/image'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from 'ui/src/images'

import {
  Wrapper,
  ApprovalStep,
  MainTransactionStep,
  StepTitle,
  SuccessIcon,
  TransactionLink,
  IconWrapper,
  DividerWrapper,
  StyledRCPinBottom,
  DividerLine,
  ResetButton,
} from './styles'

import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import Spinner from '@/ui/Spinner'

type TransactionTrackingProps = {
  className?: string
  approved?: boolean
}

const TransactionTracking = ({ className, approved = false }: TransactionTrackingProps) => {
  const { stakingModule, depositApproval, approveDepositTransaction, depositTransaction, setTransactionsReset } =
    useStore((state) => state.scrvusd)

  const inputApprovedAmount = depositApproval.approval

  const approvalConfirmed = approveDepositTransaction.transactionStatus === 'success'
  const approvalConfirming = approveDepositTransaction.transactionStatus === 'confirming'
  const approvalLoading = approveDepositTransaction.transactionStatus === 'loading'
  const getApprovalTitle = () => {
    if (approvalConfirming) {
      return t`Approve in wallet`
    }
    if (approvalLoading) {
      return t`Approval awaiting confirmation`
    }
    return t`Approval Confirmed`
  }
  const approvalTitle = getApprovalTitle()

  const approvalReady = !approvalConfirmed || depositApproval.approval
  const depositConfirmed = depositTransaction.transactionStatus === 'success'
  const depositConfirming = depositTransaction.transactionStatus === 'confirming'
  const depositLoading = depositTransaction.transactionStatus === 'loading'
  const getDepositTitle = () => {
    if (depositConfirming) {
      return t`Confirm Deposit`
    }
    if (depositLoading) {
      return t`Deposit awaiting confirmation`
    }
    if (inputApprovedAmount && !depositConfirmed) {
      return t`Confirm Deposit`
    }
    return t`Deposit Confirmed`
  }
  const depositTitle = getDepositTitle()

  return (
    <Wrapper className={className}>
      <ApprovalStep>
        <Image height={20} src={stakingModule === 'deposit' ? RCCrvUSDLogoXS : RCScrvUSDLogoXS} alt="Token Logo" />
        <Box flex flexColumn>
          <StepTitle>{approvalTitle}</StepTitle>
          {approvalConfirmed && (
            <TransactionLink href={approveDepositTransaction.transaction ?? ''}>{t`View transaction`}</TransactionLink>
          )}
        </Box>
        <IconWrapper>
          {(approvalConfirmed || inputApprovedAmount) && <SuccessIcon name="CheckmarkFilled" size={20} />}
          {approvalConfirming && <Icon name="Wallet" size={20} />}
          {approvalLoading && <Spinner size={16} />}
        </IconWrapper>
      </ApprovalStep>
      <DividerWrapper>
        <DividerLine />
      </DividerWrapper>
      <MainTransactionStep approvalReady={approvalReady}>
        <StyledRCPinBottom />
        <Box flex flexColumn>
          <StepTitle>{depositTitle}</StepTitle>
          {depositConfirmed && (
            <TransactionLink href={approveDepositTransaction.transaction ?? ''}>{t`View transaction`}</TransactionLink>
          )}
        </Box>
        <IconWrapper>
          {depositConfirmed && <SuccessIcon name="CheckmarkFilled" size={20} />}
          {depositConfirming && <Icon name="Wallet" size={20} />}
          {depositLoading && <Spinner size={16} />}
        </IconWrapper>
      </MainTransactionStep>
      {depositConfirmed && (
        <ResetButton variant="text" onClick={() => setTransactionsReset()}>{t`Make another deposit`}</ResetButton>
      )}
    </Wrapper>
  )
}

export default TransactionTracking
