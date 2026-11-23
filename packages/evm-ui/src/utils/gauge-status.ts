import type { GaugeStatus } from '@ui/lib/gauge-status'

/** `null` when there's no gauge or the DAO never added it to the GaugeController. Only approved gauges are checked for being killed. */
export const fetchGaugeStatus = async ({
  isRegistered,
  isKilled,
}: {
  isRegistered: () => Promise<boolean | null>
  isKilled: () => Promise<boolean | null>
}): Promise<GaugeStatus | null> => ((await isRegistered()) ? ((await isKilled()) ? 'inactive' : 'active') : null)
