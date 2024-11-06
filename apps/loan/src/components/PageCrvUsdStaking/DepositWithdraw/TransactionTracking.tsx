import styled from 'styled-components'
import Image from 'next/image'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { RCCrvUSDLogoXS, RCScrvUSDLogoXS, RCPinBottom } from 'ui/src/images'

import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'
import { ExternalLink } from '@/ui/Link'

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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Step = styled.div`
  padding: var(--spacing-2);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
`

const ApprovalStep = styled(Step)``

const MainTransactionStep = styled(Step)<{ approvalReady: boolean }>`
  opacity: ${({ approvalReady }) => (approvalReady ? 1 : 0.3)};
`

const StepTitle = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const TransactionLink = styled(ExternalLink)`
  font-size: var(--font-size-1);
  color: var(--primary-400);
  text-decoration: none;
  border: none;
  text-transform: none;
`

const IconWrapper = styled.div`
  margin: auto 0 auto auto;
  align-items: center;
  display: flex;
`

const SuccessIcon = styled(Icon)`
  color: var(--chart-green);
`

const StyledRCPinBottom = styled(RCPinBottom)`
  min-width: 1.25rem;
  min-height: 1.25rem;
  max-width: 1.25rem;
  min-width: 1.25rem;
`

const DividerWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 1.25rem;
  height: 0.8rem;
  margin-left: var(--spacing-2);
  opacity: 0.3;
`

const DividerLine = styled.div`
  height: 100%;
  width: 0.09375rem;
  margin: 0 auto;
  background-color: var(--page--text-color);
`

const ResetButton = styled(Button)`
  margin: var(--spacing-2) auto 0;
`

export default TransactionTracking
