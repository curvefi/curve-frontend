import { asStellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS, type StellarFactories, type StellarNetwork } from '@/stellar/lib/networks'
import { recordValues } from '@primitives/objects.utils'
import { POOL_TYPES } from '@ui/features/create-pool/constants'
import { getCreatePoolTokens } from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormValues, PoolTypeOption } from '@ui/features/create-pool/types'
import type { FieldsOf } from '@ui/lib/validation/types'

export const getCreatePoolTypes = (network: StellarNetwork) => {
  const factories: StellarFactories = STELLAR_NETWORKS[network].factories
  return recordValues(POOL_TYPES).map(type => ({ ...type, disabled: !factories[type.id]?.length }))
}

/** Selects the sole enabled pool type and its default preset; returns no overrides when there is no unique choice. */
export const getPoolTypeDefaults = (poolTypes: readonly PoolTypeOption[]) => {
  const available = poolTypes.filter(type => !type.disabled)
  if (available.length !== 1) return {}
  const { id, defaultPreset, presets } = available[0]
  return { poolType: id, preset: defaultPreset, ...presets.find(preset => preset.id === defaultPreset)?.values }
}

export const getCreatePoolValues = (values: FieldsOf<CreatePoolFormValues>) => ({
  poolName: values.poolName,
  symbol: values.symbol,
  amplification: values.amplification,
  fee: values.fee,
  feeMultiplier: values.feeMultiplier,
  priceOracleAveragingWindow: values.priceOracleAveragingWindow,
  coins: getCreatePoolTokens(values, values.tokenCount)?.map(token => asStellarContract(token?.address)),
})
