import styled from 'styled-components'
import TextEllipsis from '@/ui/TextEllipsis'
import { Chip } from '@/ui/Typography'

export const TokenBalancePercent = styled.span`
  font-size: 0.875rem; //14px
  opacity: 0.7;
`

export const ExternalLinkToken = styled(TextEllipsis)`
  font-weight: bold;
  text-transform: initial;
`

export const TokenInfo = styled(Chip)`
  margin: auto var(--spacing-1)
`
