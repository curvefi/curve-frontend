import type { TenderlyAccount } from './account'
import type { TestnetProps } from './types'
import { requestTenderlyControlPlane } from './vnet-request'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/deleteVnets */
export type DeleteVirtualTestnetOptions = {
  /** @see {@link TestnetProps.id} for complete documentation */
  vnetId: TestnetProps['id']
}

export const deleteVirtualTestnet = ({
  accountSlug,
  projectSlug,
  accessKey,
  vnetId,
}: TenderlyAccount & DeleteVirtualTestnetOptions) =>
  requestTenderlyControlPlane<unknown>({
    errorMessage: `Failed to delete virtual testnet '${JSON.stringify(vnetId)}'`,
    isAccepted: response => response.isOkStatusCode || response.status === 404,
    request: {
      method: 'DELETE',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/${vnetId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': accessKey,
      },
    },
  })
