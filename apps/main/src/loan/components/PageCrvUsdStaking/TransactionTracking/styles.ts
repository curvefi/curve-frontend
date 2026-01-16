import { styled } from 'styled-components'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { RCPinBottom } from '@ui/images'
import { ExternalLink } from '@ui/Link'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const Step = styled.div`
  padding: var(--spacing-2);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
`

export const ApprovalStep = styled(Step)``

export const MainTransactionStep = styled(Step)<{ approvalReady: boolean }>`
  opacity: ${({ approvalReady }) => (approvalReady ? 1 : 0.3)};
`

export const StepTitle = styled.p`
  font-size: var(--font-size-2);
  color: var(--box--primary--color);
  font-weight: var(--bold);
`

export const TransactionLink = styled(ExternalLink)`
  font-size: var(--font-size-1);
  color: var(--link-400);
  text-decoration: none;
  border: none;
  &:hover {
    color: var(--link-400);
  }
`

export const IconWrapper = styled.div`
  margin: auto 0 auto auto;
  align-items: center;
  display: flex;
`

export const SuccessIcon = styled(Icon)`
  color: var(--chart-green);
`

export const StyledRCPinBottom = styled(RCPinBottom)`
  color: var(--box--primary--color);
  min-width: 1.25rem;
  min-height: 1.25rem;
  max-width: 1.25rem;
  min-width: 1.25rem;
`

export const WalletIcon = styled(Icon)`
  color: var(--box--primary--color);
`

export const DividerWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 1.25rem;
  height: 0.8rem;
  margin-left: var(--spacing-2);
  opacity: 0.3;
`

export const DividerLine = styled.div`
  height: 100%;
  width: 0.09375rem;
  margin: 0 auto;
  background-color: var(--box--primary--color);
`

export const ResetButton = styled(Button)`
  margin: var(--spacing-2) auto 0;
  color: var(--link-400);
  &:hover:not(:disabled),
  &:active:not(:disabled) {
    color: var(--link-400);
  }
`
