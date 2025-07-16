import { styled } from 'styled-components'
import { HealthColorKey } from '@/loan/types/loan.types'

export const HealthColorText = styled.span<{ colorKey?: HealthColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`
