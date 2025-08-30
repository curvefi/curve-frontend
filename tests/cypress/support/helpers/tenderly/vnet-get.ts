import type { TenderlyAccount } from './account'
import type { TestnetProps } from './types'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/getVnet */
export type GetVirtualTestnetOptions = {
  /** @see {@link TestnetProps.id} for complete documentation */
  vnetId: TestnetProps['id']
}

export type GetVirtualTestnetResponse = Pick<
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

export function getVirtualTestnet({
  accountSlug,
  projectSlug,
  accessKey,
  vnetId,
}: TenderlyAccount & GetVirtualTestnetOptions) {
  return cy
    .request({
      method: 'GET',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/${vnetId}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Access-Key': accessKey,
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      if (!response.isOkStatusCode) {
        throw new Error(`Failed to get virtual testnet '${vnetId}': ${response.status} ${response.statusText}`)
      }
      return response.body as GetVirtualTestnetResponse
    })
}
