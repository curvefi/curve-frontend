import type { VaultEvent } from '@curvefi/prices-api/llamalend'

export const getVaultEventChange = ({ deposit, withdrawal }: VaultEvent) => {
  const sign = deposit ? 1 : -1
  return { amounts: deposit ?? withdrawal, sign, valueColor: sign > 0 ? 'success' : 'error' } as const
}
