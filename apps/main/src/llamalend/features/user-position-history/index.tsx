import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ParsedUserLendCollateralEvent } from './hooks/useUserLendCollateralEvents'
import { UserEventsTable } from './UserEventsTable'

type UserPositionHistoryProps = {
  events: ParsedUserLendCollateralEvent[]
  isLoading: boolean
  isError: boolean
}

export const UserPositionHistory = ({ events, isLoading, isError }: UserPositionHistoryProps) => (
  <Accordion title={t`Position History`} ghost>
    <UserEventsTable events={events} loading={isLoading} isError={isError} />
  </Accordion>
)
