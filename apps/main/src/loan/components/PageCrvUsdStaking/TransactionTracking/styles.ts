import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { RCPinBottom } from '@ui/images'
import { ExternalLink } from '@ui/Link'

type DivProps = ComponentPropsWithRef<'div'>
type PProps = ComponentPropsWithRef<'p'>
type ButtonComponentProps = ComponentProps<typeof Button>
type IconComponentProps = ComponentProps<typeof Icon>
type ExternalLinkComponentProps = ComponentProps<typeof ExternalLink>
type RCPinBottomComponentProps = ComponentProps<typeof RCPinBottom>

export const Wrapper: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
`

export const Step: IStyledComponent<'web', DivProps> = styled.div`
  padding: var(--spacing-2);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
`

type StepComponentProps = ComponentProps<typeof Step>

export const ApprovalStep: IStyledComponent<'web', StepComponentProps> = styled(Step)``

type MainTransactionStepProps = { approvalReady: boolean } & StepComponentProps

export const MainTransactionStep: IStyledComponent<'web', MainTransactionStepProps> = styled(
  Step,
)<MainTransactionStepProps>`
  opacity: ${({ approvalReady }) => (approvalReady ? 1 : 0.3)};
`

export const StepTitle: IStyledComponent<'web', PProps> = styled.p`
  font-size: var(--font-size-2);
  color: var(--box--primary--color);
  font-weight: var(--bold);
`

export const TransactionLink: IStyledComponent<'web', ExternalLinkComponentProps> = styled(ExternalLink)`
  font-size: var(--font-size-1);
  color: var(--link-400);
  text-decoration: none;
  border: none;
  &:hover {
    color: var(--link-400);
  }
`

export const IconWrapper: IStyledComponent<'web', DivProps> = styled.div`
  margin: auto 0 auto auto;
  align-items: center;
  display: flex;
`

export const SuccessIcon: IStyledComponent<'web', IconComponentProps> = styled(Icon)`
  color: var(--chart-green);
`

export const StyledRCPinBottom: IStyledComponent<'web', RCPinBottomComponentProps> = styled(RCPinBottom)`
  color: var(--box--primary--color);
  min-width: 1.25rem;
  min-height: 1.25rem;
  max-width: 1.25rem;
  min-width: 1.25rem;
`

export const WalletIcon: IStyledComponent<'web', IconComponentProps> = styled(Icon)`
  color: var(--box--primary--color);
`

export const DividerWrapper: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  align-items: center;
  width: 1.25rem;
  height: 0.8rem;
  margin-left: var(--spacing-2);
  opacity: 0.3;
`

export const DividerLine: IStyledComponent<'web', DivProps> = styled.div`
  height: 100%;
  width: 0.09375rem;
  margin: 0 auto;
  background-color: var(--box--primary--color);
`

export const ResetButton: IStyledComponent<'web', ButtonComponentProps> = styled(Button)`
  margin: var(--spacing-2) auto 0;
  color: var(--link-400);
  &:hover:not(:disabled),
  &:active:not(:disabled) {
    color: var(--link-400);
  }
`
