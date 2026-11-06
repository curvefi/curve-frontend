import { asStellarContract } from '@/stellar/features/connect-wallet/address'
import { getCreatePoolTokens } from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import type { FieldsOf } from '@ui/lib/validation/types'

export const getCreatePoolValues = (values: FieldsOf<CreatePoolFormValues>) => ({
  poolName: values.poolName,
  symbol: values.symbol,
  amplification: values.amplification,
  fee: values.fee,
  feeMultiplier: values.feeMultiplier,
  priceOracleAveragingWindow: values.priceOracleAveragingWindow,
  coins: getCreatePoolTokens(values, values.tokenCount)?.map(token => asStellarContract(token?.address)),
})
