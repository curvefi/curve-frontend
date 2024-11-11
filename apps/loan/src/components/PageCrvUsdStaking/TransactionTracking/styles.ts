import styled from 'styled-components'

import { RCPinBottom } from 'ui/src/images'

import Button from '@/ui/Button'
import { ExternalLink } from '@/ui/Link'
import Icon from '@/ui/Icon'

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
  font-weight: var(--bold);
`

export const TransactionLink = styled(ExternalLink)`
  font-size: var(--font-size-1);
  color: var(--primary-400);
  text-decoration: none;
  border: none;
  text-transform: none;
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
  min-width: 1.25rem;
  min-height: 1.25rem;
  max-width: 1.25rem;
  min-width: 1.25rem;
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
  background-color: var(--page--text-color);
`

export const ResetButton = styled(Button)`
  margin: var(--spacing-2) auto 0;
`
