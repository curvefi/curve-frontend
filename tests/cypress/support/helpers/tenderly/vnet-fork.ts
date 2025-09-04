import type { TenderlyAccount } from './account'
import type { TestnetProps } from './types'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/forkVnet */
export type ForkVirtualTestnetOptions = Partial<Pick<TestnetProps, 'slug' | 'display_name' | 'description'>> & {
  /**
   * @see {@link TestnetProps.id} for complete documentation
   * @remarks This differs from the `vnetId` property name used in the GET. Inconsistency at the end of Tenderly.
   */
  vnet_id: TestnetProps['id']

  // For some reason differs from just the sync_state_config object itself.
  sync_state?: TestnetProps['sync_state_config']['enabled']

  /** Wait is a flag that indicates if the request should wait for the forking process to finish or letting it complete asynchronously. */
  wait?: boolean
}

export type ForkVirtualTestnetResponse = Pick<
  TestnetProps,
  | 'id'
  | 'slug'
  | 'display_name'
  | 'description'
  | 'created_at'
  | 'fork_config'
  | 'virtual_network_config'
  | 'sync_state_config'
  | 'explorer_page_config'
  | 'status'
  | 'rpcs'
>

export const forkVirtualTestnet = ({
  accountSlug,
  projectSlug,
  accessKey,
  ...forkOptions
}: TenderlyAccount & ForkVirtualTestnetOptions) =>
  cy
    .request({
      method: 'POST',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/fork`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Access-Key': accessKey,
      },
      body: forkOptions,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (!response.isOkStatusCode) {
        throw new Error(
          `Failed to fork virtual testnet '${forkOptions.vnet_id}': ${response.status} ${response.statusText}`,
        )
      }
      return response.body as ForkVirtualTestnetResponse
    })
