import type { TenderlyAccount } from './account'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/createVnet */
export type CreateVirtualTestnetOptions = {
  /**
   * Slug of the Virtual Testnet (string of dash-separated alphanumerics)
   * @example my-staging-testnet
   * */
  slug: string

  /**
   * Display name of Virtual Testnet
   * @example My Staging Testnet
   */
  display_name?: string

  /**
   * Description for Virtual Testnet
   * @example Virtual TestNet for mainnet
   */
  description?: string

  /** Fork Configuration */
  fork_config: {
    /**
     * ID of the network from which testnet is forked
     * @example 1
     **/
    network_id: string | number

    /**
     * Block number on which forked happened
     * @example latest
     */
    block_number?: string
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

  explorer_page_config?: {
    /** Set this to true to enable public explorer page */
    enabled: boolean

    /**
     * Control verification visibility on public explorer. Use src to show full source,
     * abi to show abi without implementation, and bytecode to fully hide code.
     */
    verification_visibility: 'abi' | 'src' | 'bytecode'
  }
}

export type CreateVirtualTestnetResponse = Required<
  Pick<
    CreateVirtualTestnetOptions,
    'slug' | 'display_name' | 'description' | 'fork_config' | 'virtual_network_config' | 'sync_state_config'
  >
> & {
  /**
   * ID of the Virtual Testnet.
   * @example 4010f442-c4d9-407d-aba1-7276e3312998
   */
  id: string

  /** Created at date, can be parsed to Date */
  created_at: string

  /**
   * Network status, not sure what all values can be
   * @example running
   */
  status: string

  rpcs: {
    url: string
    name: string
  }[]
}

export function createVirtualTestnet({
  accountSlug,
  projectSlug,
  accessKey,
  ...createOptions
}: TenderlyAccount & CreateVirtualTestnetOptions) {
  return cy
    .request({
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Access-Key': accessKey,
      },
      body: createOptions,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (!response.isOkStatusCode) {
        throw new Error(
          `Failed to create virtual testnet '${createOptions.slug}': ${response.status} ${response.statusText}`,
        )
      }
      return response.body as CreateVirtualTestnetResponse
    })
}
