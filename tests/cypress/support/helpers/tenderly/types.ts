/** Common types used by the Tenderly API */
export type TestnetProps = {
  /**
   * ID of the Virtual Testnet.
   * @example '4010f442-c4d9-407d-aba1-7276e3312998'
   */
  id: string

  /**
   * Slug of the Virtual Testnet (string of dash-separated alphanumerics)
   * @example 'my-staging-testnet'
   * */
  slug: string

  /**
   * Display name of Virtual Testnet
   * @example 'My Staging Testnet'
   */
  display_name: string

  /**
   * Description for Virtual Testnet
   * @example 'Virtual TestNet for mainnet'
   */
  description: string

  /** Created at date, can be parsed to Date */
  created_at: string

  fork_config: {
    /**
     * ID of the network from which testnet is forked
     * @example 1
     **/
    network_id: string | number

    /**
     * Block number on which forked happened
     * @example latest
     * @example '0x12c50f0a'
     */
    block_number: string
  }

  virtual_network_config: {
    chain_config: {
      /**
       * Custom chain id for Virtual Testnet
       * @example 1
       */
      chain_id: string | number
    }
  }

  sync_state_config: {
    /** Enable sync state for Virtual TestNet */
    enabled: boolean
  }

  explorer_page_config: {
    /** Set this to true to enable public explorer page */
    enabled: boolean

    /**
     * Control verification visibility on public explorer. Use src to show full source,
     * abi to show abi without implementation, and bytecode to fully hide code.
     */
    verification_visibility: 'abi' | 'src' | 'bytecode'
  }

  /**
   * Network status, not sure what all values can be
   * @example running
   */
  status: string

  /** Rpc endpoints for Virtual TestNet */
  rpcs: {
    /**
     * RPC URL endpoint
     * @example 'https://virtual.mainnet.rpc.tenderly.co/7b7b53ee-611b-4d06-87ad-8f5606dfdc21'
     */
    url: string

    /**
     * Name of the RPC endpoint
     * @example 'Admin RPC'
     */
    name: string
  }[]
}

/**
 * Creates a deep partial type that makes all properties optional recursively,
 * while preserving function types as-is
 *
 * @template T - The type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? (T[P] extends (...args: any[]) => any ? T[P] : DeepPartial<T[P]>) : T[P]
}

/**
 * A utility type that makes specific properties of a type optional while keeping all other properties required.
 *
 * @template T - The original type to modify
 * @template K - The keys from T that should be made optional
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * // Make 'email' optional
 * type UserWithOptionalEmail = MakeOptional<User, 'email'>;
 * // Result: { id: string; name: string; email?: string }
 *
 * // Make multiple properties optional
 * type UserWithOptionalFields = MakeOptional<User, 'name' | 'email'>;
 * // Result: { id: string; name?: string; email?: string }
 * ```
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
