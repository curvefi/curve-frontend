/** Types related to Tenderly Virtual Testnet transactions */
export type VnetTransactionResponse = {
  /**
   * Unique identifier of the transaction.
   * @example '12345'
   */
  id: string

  /**
   * Identifier of the Virtual Testnet.
   * @example '67890'
   */
  vnet_id: string

  /**
   * Origin of the transaction.
   * @example 'user'
   */
  origin: string

  /**
   * Category of the transaction.
   * @example 'payment'
   */
  category: string

  /**
   * Kind of transaction.
   * @example 'transfer'
   */
  kind: string

  /**
   * Status of the transaction.
   * @example 'success'
   */
  status: string

  /**
   * Reason for transaction error.
   * @example 'Insufficient funds'
   */
  error_reason: string

  /**
   * RPC method used for the transaction.
   * @example 'eth_sendTransaction'
   */
  rpc_method: string

  /**
   * Timestamp when the transaction was created.
   * Can be parsed into a Date instance.
   * @example '2024-04-21T12:00:00Z'
   */
  created_at: string

  /**
   * Block number of the transaction.
   * @example '123456'
   */
  block_number: string

  /**
   * Hash of the block containing the transaction.
   * @example '0xabcdef123456...'
   */
  block_hash: string

  /**
   * Hash of the transaction.
   * @example '0xabcdef123456...'
   */
  tx_hash: string

  /**
   * Index of the transaction within the block.
   * @example '1'
   */
  tx_index: string

  /**
   * Sender address of the transaction.
   * @example '0x123456789...'
   */
  from: string

  /**
   * Receiver address of the transaction.
   * @example '0x987654321...'
   */
  to: string

  /**
   * Input data of the transaction.
   * @example '0xabcdef123456...'
   */
  input: string

  /**
   * Nonce of the transaction.
   * @example '123'
   */
  nonce: string

  /**
   * Value of the transaction.
   * @example '1000000000000000000'
   */
  value: string

  /**
   * Gas of the transaction.
   * @example '21000'
   */
  gas: string

  /**
   * Gas price of the transaction.
   * @example '1000000000'
   */
  gas_price: string

  /**
   * Maximum priority fee per gas of the transaction.
   * @example '1000000000'
   */
  max_priority_fee_per_gas: string

  /**
   * Maximum fee per gas of the transaction.
   * @example '2000000000'
   */
  max_fee_per_gas: string

  /**
   * Signature of the transaction.
   * @example '0xabcdef123456...'
   */
  signature: string

  /**
   * Type of the transaction.
   * @example '1'
   */
  type: string

  /**
   * Overrides for specific state objects.
   * Keys are account identifiers, values define the overrides.
   */
  stateOverrides?: Record<string, TenderlyStateOverride>

  /**
   * Overrides for block data.
   * @example { "number": "0x124214", "timestamp": "0x124124" }
   */
  blockOverrides?: TenderlyBlockOverrides

  /**
   * Name of the function invoked by the transaction.
   */
  function_name?: string
}

/** Per-account state override used in Tenderly Virtual Testnet transactions */
export type TenderlyStateOverride = {
  /** Nonce override for the account */
  nonce?: number

  /**
   * Bytecode that will override the code associated to the given account.
   * @example '0x6001600055'
   */
  code?: string

  /**
   * Balance override for the account in hex format.
   * @example '0x113b9aca01'
   */
  balance?: string

  /**
   * Overrides of storage slots for the account.
   * Keys are storage slots, values are the override values.
   */
  storage?: Record<string, string>
}

/** Block data overrides used in Tenderly Virtual Testnet transactions */
export type TenderlyBlockOverrides = {
  /**
   * Block number override.
   * @example '0x124214'
   */
  number?: string

  /**
   * Timestamp override.
   * @example '0x124124'
   */
  timestamp?: string
}
