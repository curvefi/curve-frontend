import styled from 'styled-components'

export const HealthColorText = styled.span<{ colorKey?: HeathColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`
