import { txIsConfirming, txIsSuccess, txIsLoading } from '@/loan/components/PageCrvUsdStaking/utils'
import { useStore } from '@/loan/store/useStore'
import { Box } from '@ui/Box'
import { Spinner } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'
import {
  Wrapper,
  MainTransactionStep,
  StepTitle,
  SuccessIcon,
  TransactionLink,
  IconWrapper,
  StyledRCPinBottom,
  ResetButton,
  WalletIcon,
} from './styles'

type WithdrawTrackingProps = {
  className?: string
}

export const WithdrawTracking = ({ className }: WithdrawTrackingProps) => {
  const withdrawTransaction = useStore((state) => state.scrvusd.withdrawTransaction)
  const setTransactionsReset = useStore((state) => state.scrvusd.setTransactionsReset)

  const withdrawConfirmed = txIsSuccess(withdrawTransaction.transactionStatus)
  const withdrawConfirming = txIsConfirming(withdrawTransaction.transactionStatus)
  const withdrawLoading = txIsLoading(withdrawTransaction.transactionStatus)

  const getWithdrawTitle = () => {
    if (withdrawConfirming) {
      return t`Confirm Withdraw`
    }
    if (withdrawLoading) {
      return t`Withdraw awaiting confirmation`
    }
    return t`Withdraw Confirmed`
  }
  const withdrawTitle = getWithdrawTitle()

  return (
    <Wrapper className={className}>
      <MainTransactionStep approvalReady={true}>
        <StyledRCPinBottom />
        <Box flex flexColumn>
          <StepTitle>{withdrawTitle}</StepTitle>
          {withdrawConfirmed && (
            <TransactionLink href={withdrawTransaction.transaction ?? ''}>{t`View transaction`}</TransactionLink>
          )}
        </Box>
        <IconWrapper>
          {withdrawConfirmed && <SuccessIcon name="CheckmarkFilled" size={20} />}
          {withdrawConfirming && <WalletIcon name="Wallet" size={20} />}
          {withdrawLoading && <Spinner size={16} />}
        </IconWrapper>
      </MainTransactionStep>
      {withdrawConfirmed && (
        <ResetButton
          variant="text"
          size="small"
          onClick={() => setTransactionsReset()}
        >{t`Make another withdrawal`}</ResetButton>
      )}
    </Wrapper>
  )
}
