import type { MakeOptional } from '@ui-kit/types/util'
import type { TenderlyAccount } from './account'
import type { TestnetProps } from './types'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/createVnet */
export type CreateVirtualTestnetOptions = Pick<TestnetProps, 'slug' | 'virtual_network_config' | 'sync_state_config'> &
  Partial<Pick<TestnetProps, 'display_name' | 'description' | 'explorer_page_config'>> & {
    /** Fork Configuration */
    fork_config: MakeOptional<TestnetProps['fork_config'], 'block_number'>
  }

export type CreateVirtualTestnetResponse = Pick<
  TestnetProps,
  | 'id'
  | 'slug'
  | 'created_at'
  | 'display_name'
  | 'description'
  | 'fork_config'
  | 'virtual_network_config'
  | 'sync_state_config'
  | 'status'
  | 'rpcs'
>

export const createVirtualTestnet = ({
  accountSlug,
  projectSlug,
  accessKey,
  ...createOptions
}: TenderlyAccount & CreateVirtualTestnetOptions) =>
  cy
    .request({
      method: 'POST',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets`,
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
