import type { TenderlyAccount } from './account'
import type { TestnetProps } from './types'
import { requestTenderlyControlPlane } from './vnet-request'

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

export const getVirtualTestnet = ({
  accountSlug,
  projectSlug,
  accessKey,
  vnetId,
}: TenderlyAccount & GetVirtualTestnetOptions) =>
  requestTenderlyControlPlane<GetVirtualTestnetResponse>({
    errorMessage: `Failed to get virtual testnet '${vnetId}'`,
    request: {
      method: 'GET',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/${vnetId}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Access-Key': accessKey,
      },
    },
  }).then(response => response.body)
