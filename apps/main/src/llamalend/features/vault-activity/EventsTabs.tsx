import type { VaultActivityProps } from './types'
import { VaultActivityEventsTable } from './VaultActivityEventsTable'

export const EventsTab = ({ activity }: { activity: VaultActivityProps }) => <VaultActivityEventsTable {...activity} />
