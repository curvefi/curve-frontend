import styled from 'styled-components'
import UserInfoStats from '@/lend/components/DetailsUser/components/UserInfoStats'
import { HeathColorKey } from '@/lend/types/lend.types'

export const MainUserInfoStats = styled(UserInfoStats)`
  border: 1px solid var(--nav_button--border-color);
  display: inline-block;
  padding: var(--spacing-narrow);
`

export const MainUserInfoStatsContent = styled.span`
  font-size: var(--font-size-6);
  font-weight: bold;
`

export const HealthColorText = styled.span<{ colorKey?: HeathColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}--color)`};
`
