import Image from 'next/image'
import { t } from '@lingui/macro'

import useStore from '@/loan/store/useStore'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS } from '@ui/images'
import { txIsConfirming, txIsSuccess, txIsLoading } from '@/loan/components/PageCrvUsdStaking/utils'

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

import Icon from '@ui/Icon'
import Box from '@ui/Box'
import Spinner from '@ui/Spinner'

type DepositTrackingProps = {
  className?: string
}

const DepositTracking = ({ className }: DepositTrackingProps) => {
  const { stakingModule, depositApproval, approveDepositTransaction, depositTransaction, setTransactionsReset } =
    useStore((state) => state.scrvusd)

  const inputApprovedAmount = depositApproval.approval

  const approvalConfirmed = txIsSuccess(approveDepositTransaction.transactionStatus)
  const approvalConfirming = txIsConfirming(approveDepositTransaction.transactionStatus)
  const approvalLoading = txIsLoading(approveDepositTransaction.transactionStatus)
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
  const depositConfirmed = txIsSuccess(depositTransaction.transactionStatus)
  const depositConfirming = txIsConfirming(depositTransaction.transactionStatus)
  const depositLoading = txIsLoading(depositTransaction.transactionStatus)
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
        <ResetButton
          variant="text"
          size="small"
          onClick={() => setTransactionsReset()}
        >{t`Make another deposit`}</ResetButton>
      )}
    </Wrapper>
  )
}

export default DepositTracking
