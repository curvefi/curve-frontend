import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { STABLE_SWAP_ERRORS } from '@/stellar/lib/errors'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import { maybe } from '@primitives/objects.utils'
import { retry, type RetryOptions } from '@primitives/promise.utils'
import { Address, contract, humanizeEvents, nativeToScVal, scValToNative, StrKey, xdr } from '@stellar/stellar-sdk'
import type { DiagnosticEvent } from '@stellar/stellar-sdk/xdr'
import { NoRetryError } from '@ui/features/queries/factory'
import { simulateStellarTransaction } from './transaction'

export const MAX_INCLUSION_FEE = 100_000n // ≈ $0.0018 at the time of writing; resource fees are separate.

export const StellarFetchRetry = {
  retries: 2,
  delay: () => 1000,
  shouldRetry: (error: unknown) => /failed to fetch|fetch failed|network ?error/i.test((error as Error).message),
} satisfies RetryOptions

type ContractArgument = StellarAddress | StellarContract | bigint | number | boolean | xdr.ScVal | ContractArgument[]

export const encodeContractValue: typeof nativeToScVal = (value, options) => nativeToScVal(value, options)

const encodeContractArgument = (value: ContractArgument): xdr.ScVal =>
  Array.isArray(value)
    ? xdr.ScVal.scvVec(value.map(encodeContractArgument))
    : typeof value === 'string'
      ? new Address(value).toScVal()
      : nativeToScVal(
          value,
          typeof value === 'bigint' ? { type: 'i128' } : typeof value === 'number' ? { type: 'u32' } : {},
        )

export async function simulateContractCall<T>(
  network: StellarNetwork,
  contractId: StellarContract,
  method: string,
  args: ContractArgument[] = [],
  account?: StellarAddress,
) {
  const { rpcUrl, networkPassphrase, allowHttp } = STELLAR_NETWORKS[network]
  const transaction = await retry(
    () =>
      contract.AssembledTransaction.build<T>({
        contractId,
        method,
        args: args.map(encodeContractArgument),
        publicKey: account,
        address: account,
        networkPassphrase,
        rpcUrl,
        allowHttp,
        fee: MAX_INCLUSION_FEE.toString(),
        simulate: false, // Simulate below: the SDK's automatic assembly overflows for fees requiring a fee bump.
        parseResultXdr: value => scValToNative(value) as T,
      }),
    StellarFetchRetry,
  )
  try {
    await retry(() => simulateStellarTransaction(transaction), StellarFetchRetry)
  } catch (e) {
    throw convertStellarError(transaction.simulation?.events, contractId) ?? e
  }
  return transaction
}

export const readContract = async <T>(
  network: StellarNetwork,
  contractId: StellarContract,
  method: string,
  args: ContractArgument[] = [],
) => (await simulateContractCall<T>(network, contractId, method, args)).result

export const isContractAddress = (address: string): address is StellarContract => StrKey.isValidContract(address)

export const convertStellarError = (events: DiagnosticEvent[] | undefined, contract: StellarContract) =>
  maybe(events, events =>
    maybe(
      humanizeEvents(events)
        .map(
          ({ type, topics, contractId }) =>
            contractId === contract &&
            type === 'diagnostic' &&
            (topics as ['error', { type: 'contract'; code: number }])?.[1].code,
        )
        .findLast(Boolean),
      code =>
        maybe(
          STABLE_SWAP_ERRORS[code as keyof typeof STABLE_SWAP_ERRORS],
          ({ title, description }) => new NoRetryError(`${title}(${code}): ${description}`),
        ),
    ),
  )
